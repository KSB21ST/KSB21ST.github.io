---
layout: post
title:  "How to Shop for Free Online"
date:   2021-01-08 19:31:29 +0900
categories: articles
---
 온라인 쇼핑몰에서 무료로 물건을 사거나 한 개 값을 지불하고 두 개를 살 수 있는 등의 일에 대한 굉장히 흥미로운 논문이다. 그것도 복잡한 코드를 짜거나 툴을 사용한 것이 아니라 온라인 쇼핑몰에서 사용하는 결제 원리를 파악해서 url argument를 조금만 바꿔서 가능한 해킹이라는 점이 재밌다.  해킹에 대해서 잘 모르는 내가 읽기에도, 배우기에도 매우 좋은 논문이었다.

## Background

 이 논문이 연구 주제로 삼은 건 주로 eCommerce platform의 허점이다. eCommerce platform이라는 건 쇼핑몰의 기본 틀 정도라고 생각할 수 있을 것 같다. 상품을 구경할 수 있는 창이 있고, 상품을 선택해서 주문을 할 수 있는 그런 모든 과정을 이 platform에서 하게 된다. 온라인 쇼핑몰을 자사가 직접 개발할 수도 있고(closed source) 아니면 공개된 소스를 활용해서 거기에 상품을 등록하는 간편한 방법도 있다. 이런 걸 open source eCommerce platform 이라고 할 수 있는데 이 논문이 연구됐을 당시 가장 유명한 오픈소스 플랫폼이 NopCommerce 와 Interspire 였던 모양이다. NopCommerce는 검색해보니 지금도 많이 쓰이는 것 같다.
 연구자들은 NopCommerce와 Interspire 를 직접 자신들의 웹서버에 설치하고 간편한 쇼핑몰을 만들었다. 그리고 결제 시스템(Amazon Payments, Google checkout, PayPal)들을 연동했다. 이들 사이에 오가는 정보를 파악하기 위해 Fiddler와 Live HTTP Headers 라는 툴을 사용했다. Live HTTP Headers 는 firefox에 add-on으로 사용할 수 있는 모양인데, 둘 다 네트워크 통신을 모니터링 할 수 있는 툴이다.
 이 논문을 모델로 연구를 진행하려 한다면 아마 한국 쇼핑몰들이 많이 사용하는 오픈 소스 eCommerce platform을 찾는 것이 좋을 것 같다. 또는 eCommerce platform의 로직을 스스로 짜거나(그러나 이건 시간이 정말 많이 걸릴 것 같다). 그리고 네이버페이, 카카오페이, 토스 처럼 한국에서 정말 많이 사용되는 간편결제 시스템으로 연동을 시켜서 fiddler나 Live HTTP Headers처럼 add-on으로 네트워크 통신을 분석하면 될 것 같다.
 정리해서 말하자면 이 논문은 세 명의 플레이어들 사이의 네트워크 통신을 분석한 것이다. 고객, 가맹점 서버, 그리고 간편 결제 시스템 서버. 논문에서는 각각을 shopper(attacker), Target store(merchant), Caas(Cashier-as-a-Service) 라고 표현했다. 
 
 고객 부분이 조금 헷갈렸는데, 브라우저와 서버에 대한 개념이 제대로 안 잡혀서 그랬던 것 같다. 빈 브라우저에 가맹점 서버를 작동시킬 수 있는 uri를 치면 그제서야 브라우저에 가맹점 서버가 보내온 내용을 보여준다. 그러니까 고객 입장에서는 특정 물건에 대한 주문서를 가맹점으로부터 받아오려면 주문서를 요구하는 uri를 먼저 가맹점 서버로 보내야 하는 것이다. uri를 가맹점 서버로 보내는 방법은 브라우저에 uri를 치면 된다.
 
## Preview

 논문에서는 크게 2가지 파트로 나누어 설명한다. 이 논문은 자신들이 연구해서 발견한 실제 허점을 설명하고, 어떤 eCommerce platform이 있을 때 그 platform에서 허점을 발견할 수 있는 방법의 complexity까지 분석했다. 그러나 뒤에 부분은 크게 관심이 없어서 자세히 읽지 않았다. 첫 번째 부분보다 비중도 작게 차지하고 있다.
 다시 첫 번째 부분을 보면, 크게 네 파트로 나눌 수 있다. NopCommerce 허점 분석, Interspire 허점 분석, Amazon SDK 허점 분석, closed source 상점 두 개의 허점 분석(Buy.com, JR.com).
 첫 두 파트를 더 세부적으로 나누자면 NopCommerce를 이용한 허점 두 가지(각각 PayPal, Amazon 결제 서비스 연동), Interspired의 허점 분석(각각 PayPal Express, PayPal Standard, Google Checkout, Amazon Simple Pay 연동)으로 볼 수 있다. 

 - [NopCommerce](#NopCommerce)
	 - [PayPal Standard](#Nop_PayPal)
	 - Amazon simple pay
 - Interspire
	 - PayPal Express
	 - PayPal Standard
	 - Google Checkout
	 - Amazon Simple Pay
 - Amazon SDK
 - closes source

 논문의 Attacker 모델은 merchant(가맹점)과 Caas(간편결제서비스)가 공개하는 web API에 argument를 바꿔서 넣거나 변형하는 방법이다. 결제를 할 때 보안을 위해 확인해야 할 것은 다음과 같다:
 
 (M: merchant, I: item, S: shopper)
1. M owns I
2. S 가 I 를 살 때 반드시 값을 지불해야 한다
3. 하나의 I에 대해서 한 번의 결제가 이루어진다
4. S가 지불한 값이 I의 가격과 같아야 한다

논문에서는 이것을 Security Invariant 라고 말했다. 결국엔 preserving invariant가 중요하다. shopper, merchant, CaaS가 서로 소통할 때 이 invariant에 대해 모두 같은 정보를 가지고 있어야 한다는 것이다. 그러나 merchant과 CaaS가 소통할 때 오해가 생기거나, attacker가 고의적으로 web API 에 간섭할 수 있다.

한계점은 CaaS가 오픈소스가 아니라는 점이다. 따라서 CaaS가 외부로 보내는 신호와 받는 신호만 분석할 수 있고, CaaS 내부의 코드는 알 수 없다. 이를 논문에서는 CaaS를 blackbox로 두고 연구를 진행했다고 표현했다.

###### chp1 <a id="NopCommerce"></a>
## NopCommerce 
###### <a id="Nop_PayPal"></a>
### PayPal Express
![image](https://user-images.githubusercontent.com/58674914/103984517-a47f9380-51ca-11eb-8467-2cb2ade56fe6.png){: width="20%" height="20%"}