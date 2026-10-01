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

document.getElementById('inquiry-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('form-status');
  if (!siteConfig.formEndpoint) {
    status.textContent = '상담 접수 기능 연결 전입니다. 지금 입력한 정보는 전송되거나 저장되지 않았습니다.';
    status.classList.add('status-attention');
    return;
  }
  const submitButton = event.currentTarget.querySelector('[type="submit"]');
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  status.textContent = '상담 요청을 보내고 있습니다.';
  submitButton.disabled = true;
  try {
    const response = await fetch(siteConfig.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Request failed');
    const result = await response.json();
    if (result.ok !== true) throw new Error('Request was not accepted');
    event.currentTarget.reset();
    spaceOptions.forEach((item) => item.classList.remove('selected'));
    status.textContent = result.alertSent === false
      ? '상담 내용은 저장됐지만 운영자 알림 전송에 문제가 있습니다. 다시 제출하지 않으셔도 됩니다.'
      : '상담 요청이 접수되었습니다. 확인 후 연락드리겠습니다.';
    status.classList.remove('status-attention');
  } catch {
    status.textContent = '전송에 실패했습니다. 잠시 뒤 다시 시도하거나 전화 상담을 이용해 주세요.';
    status.classList.add('status-attention');
  } finally {
    submitButton.disabled = false;
  }
});
