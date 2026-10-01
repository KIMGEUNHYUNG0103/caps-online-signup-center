document.getElementById('year').textContent = new Date().getFullYear();

const siteConfig = window.CAPS_SITE_CONFIG || {};
const phoneLink = document.querySelector('[data-phone-link]');
const phoneLabel = document.querySelector('[data-phone-label]');
const kakaoLink = document.querySelector('[data-kakao-link]');
const contactPending = document.querySelector('[data-contact-pending]');
if (siteConfig.representativePhone && phoneLink && phoneLabel) {
  const digits = siteConfig.representativePhone.replace(/[^\d+]/g, '');
  phoneLink.href = `tel:${digits}`;
  phoneLabel.textContent = siteConfig.representativePhone;
  phoneLink.hidden = false;
}
if (siteConfig.kakaoOpenChatUrl && kakaoLink) {
  try {
    const chatUrl = new URL(siteConfig.kakaoOpenChatUrl);
    if (chatUrl.protocol === 'https:') {
      kakaoLink.href = chatUrl.href;
      kakaoLink.hidden = false;
    }
  } catch {}
}
if (contactPending) {
  const phoneMissing = !siteConfig.representativePhone;
  const kakaoMissing = !siteConfig.kakaoOpenChatUrl;
  contactPending.textContent = phoneMissing && kakaoMissing
    ? '대표 전화번호와 카카오톡 오픈채팅 주소를 받으면 연결할게요.'
    : phoneMissing
      ? '대표 전화번호를 받으면 연결할게요.'
      : kakaoMissing
        ? '카카오톡 오픈채팅 주소를 받으면 연결할게요.'
        : '';
  contactPending.hidden = !phoneMissing && !kakaoMissing;
}
document.querySelectorAll('[data-business-name]').forEach((element) => {
  element.textContent = siteConfig.businessName || '';
  element.hidden = !siteConfig.businessName;
});
document.querySelectorAll('[data-business-address]').forEach((element) => {
  element.textContent = siteConfig.businessAddress || '';
  element.hidden = !siteConfig.businessAddress;
});

const spaceOptions = [...document.querySelectorAll('.space-card')];
const spaceInputs = [...document.querySelectorAll('input[name="space"]')];
const serviceSelect = document.querySelector('select[name="service"]');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primary-nav');
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? '메뉴 열기' : '메뉴 닫기');
  primaryNav?.classList.toggle('nav-open', !expanded);
});
primaryNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', '메뉴 열기');
  primaryNav.classList.remove('nav-open');
}));
document.querySelectorAll('[data-service]').forEach((tile) => {
  tile.addEventListener('click', () => {
    if (serviceSelect) serviceSelect.value = tile.dataset.service;
  });
});
spaceOptions.forEach((card) => {
  card.addEventListener('click', () => {
    const value = card.dataset.space;
    const matchingInput = spaceInputs.find((input) => input.value === value);
    if (matchingInput) matchingInput.checked = true;
    spaceOptions.forEach((item) => item.classList.toggle('selected', item === card));
    document.getElementById('inquiry').scrollIntoView({ behavior: 'smooth' });
  });
});

const inquiryForm = document.getElementById('inquiry-form');
const responseFrame = document.createElement('iframe');
responseFrame.name = 'caps-lead-response';
responseFrame.title = '상담 접수 처리';
responseFrame.hidden = true;
document.body.append(responseFrame);

let pendingLead = null;
let pendingTimer = null;

window.addEventListener('message', (event) => {
  if (event.source !== responseFrame.contentWindow) return;
  if (!/^https:\/\/(script\.google\.com|script\.googleusercontent\.com|[a-z0-9-]+-script\.googleusercontent\.com)$/.test(event.origin)) return;
  const result = event.data;
  if (!pendingLead || !result || result.channel !== 'caps-lead-result' || result.requestId !== pendingLead.requestId) return;

  clearTimeout(pendingTimer);
  const submitButton = inquiryForm.querySelector('[type="submit"]');
  pendingLead = null;
  submitButton.disabled = false;
  if (result.ok !== true) {
    formStatus('접수에 실패했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.', true);
    return;
  }

  inquiryForm.reset();
  spaceOptions.forEach((item) => item.classList.remove('selected'));
  formStatus(result.alertSent === false
    ? '상담 내용은 저장됐지만 운영자 알림 전송에 문제가 있습니다. 다시 제출하지 않으셔도 됩니다.'
    : '상담 요청이 접수되었습니다. 확인 후 연락드리겠습니다.', result.alertSent === false);
});

function formStatus(message, attention) {
  const status = document.getElementById('form-status');
  status.textContent = message;
  status.classList.toggle('status-attention', Boolean(attention));
}

inquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = document.getElementById('form-status');
  if (!siteConfig.formEndpoint) {
    status.textContent = '상담 접수 기능 연결 전입니다. 지금 입력한 정보는 전송되거나 저장되지 않았습니다.';
    status.classList.add('status-attention');
    return;
  }
  if (pendingLead) return;
  const submitButton = event.currentTarget.querySelector('[type="submit"]');
  const formData = new FormData(event.currentTarget);
  const requestId = 'CAPS-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
  const payload = {
    requestId,
    submittedAt: new Date().toISOString(),
    service: String(formData.get('service') || ''),
    space: String(formData.get('space') || ''),
    name: String(formData.get('name') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    region: String(formData.get('region') || '').trim(),
    message: String(formData.get('message') || '').trim(),
    consent: Boolean(inquiryForm.querySelector('input[name="consent"]')?.checked)
  };
  pendingLead = payload;
  submitButton.disabled = true;
  status.textContent = '상담 요청을 보내고 있습니다.';
  try {
    const endpoint = new URL(siteConfig.formEndpoint);
    if (endpoint.protocol !== 'https:') throw new Error('invalid endpoint');
    const transport = document.createElement('form');
    transport.method = 'POST';
    transport.action = endpoint.href;
    transport.target = responseFrame.name;
    const fields = {
      payload: JSON.stringify(payload),
      website: String(formData.get('website') || ''),
      parentOrigin: window.location.origin === 'null' ? '' : window.location.origin
    };
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      transport.append(input);
    });
    document.body.append(transport);
    transport.submit();
    transport.remove();
    pendingTimer = setTimeout(() => {
      if (!pendingLead || pendingLead.requestId !== requestId) return;
      pendingLead = null;
      submitButton.disabled = false;
      formStatus('접수 확인이 지연되고 있습니다. 중복 제출 전 운영자에게 문의해 주세요.', true);
    }, 25000);
  } catch (error) {
    pendingLead = null;
    submitButton.disabled = false;
    formStatus('접수 연결에 문제가 있습니다. 잠시 뒤 다시 시도해 주세요.', true);
  }
});
