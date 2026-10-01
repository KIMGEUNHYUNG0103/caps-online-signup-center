# GitHub Pages publication package

This folder contains only the static files needed for the landing page. It excludes the PHP API bridge and private setup files. The form remains disabled until a secure external endpoint is configured, so inquiries are not stored or sent yet.

- Custom domain: `xn--o39au1t8yhcnbu4hw7bwc804ewsf.com` (`캡스온라인가입센터.com`)
- `CNAME`: the GitHub Pages custom domain
- `index.html`, `styles.css`, `script.js`, `site-config.js`, `privacy.html`: static site files

The existing `KIMGEUNHYUNG0103.github.io` repository is already assigned to `www.xn--l89ap9efxb823bcqa80c.com` (`www.견적주는남자.com`). Publish this folder in a separate repository so the existing site remains unchanged. Then enable Pages for that repository, set the custom domain above, and configure Gabia DNS: apex A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; set the `www` CNAME to `KIMGEUNHYUNG0103.github.io`. Complete the GitHub Pages custom-domain step before changing DNS.
