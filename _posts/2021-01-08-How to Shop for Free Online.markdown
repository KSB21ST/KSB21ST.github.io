---
layout: post
title:  "How to Shop for Free Online"
date:   2021-01-08 19:31:29 +0900
categories: articles
---
wang et al, 2011


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

 - NopCommerce
	 - [PayPal Standard](#Nop_PayPal)
	 - Amazon simple pay
 - Interspire
	 - PayPal Express
	 - PayPal Standard
	 - Google Checkout
	 - Amazon Simple Pay
 - [Amazon SDK](#amamzonsdk)
 - [closed source](#closed_source)
	- Buy.com
	- JR.com

 이 중에서 첫 번째 모델(NopCommerce - PayPal Standard)만 설명하고, 나머지는 간단하게 설명하고 넘어가겠다.

 논문의 Attacker 모델은 merchant(가맹점)과 Caas(간편결제서비스)가 공개하는 web API에 argument를 바꿔서 넣거나 변형하는 방법이다. 결제를 할 때 보안을 위해 확인해야 할 것은 다음과 같다:
 
 (M: merchant, I: item, S: shopper)
1. M owns I
2. S 가 I 를 살 때 반드시 값을 지불해야 한다
3. 하나의 I에 대해서 한 번의 결제가 이루어진다
4. S가 지불한 값이 I의 가격과 같아야 한다

논문에서는 이것을 Security Invariant 라고 말했다. 결국엔 preserving invariant가 중요하다. shopper, merchant, CaaS가 서로 소통할 때 이 invariant에 대해 모두 같은 정보를 가지고 있어야 한다는 것이다. 그러나 merchant과 CaaS가 소통할 때 오해가 생기거나, attacker가 고의적으로 web API 에 간섭할 수 있다.

한계점은 CaaS가 오픈소스가 아니라는 점이다. 따라서 CaaS가 외부로 보내는 신호와 받는 신호만 분석할 수 있고, CaaS 내부의 코드는 알 수 없다. 이를 논문에서는 CaaS를 blackbox로 두고 연구를 진행했다고 표현했다.

기본적인 규칙을 설명하자면 https 프로토콜에는 request와 response가 있다. origin 사이트에서 target 사이트로 request를 보내면, target에서 origin으로 응답 response를 주는 셈이다. 이 논문에서 request는 a로, request는 b로 표현했다. 그리고 한 번의 통신을 각각 RT1, RT2, ... 이렇게 두었다. RT1.a.a는 RT1.a 바로 다음에 RT1.b 가 생성되기 전에 진행되는 요청이다. 그러니까 RT1.a -> RT1.a.a -> RT1.a.b -> RT1.b -> RT2.a -> RT2.b -> ... 이런식으로 생각할 수 있다.


###### <a id="Nop_PayPal"></a>
### NopCommerce - PayPal Express

![image](https://user-images.githubusercontent.com/58674914/103984517-a47f9380-51ca-11eb-8467-2cb2ade56fe6.png){: width="40%" height="40%"}

 아무튼 기본적인 구조를 보면 
 1. shopper - merchant 에서 shopper는 구매 버튼을 누르면 merchant는 결제창 주소로 응답
 2. shopper - CaaS 에서 shopper는 결제창에서 결제를 하고 CaaS는 merchant에서 구매 완료창 주소로 응답
 3. shopper - merchant 에서 shopper는 구매 완료창으로 이동한다.
 4. merchant - CaaS 에서 아직 shopper는 구매 완료를 확인한 상태가 아니다. merchant에서 CaaS 로 가맹점 identity를 보내면 CaaS는 이에 대한 확인을 하고 응답으로 orderID, gross amount를 보낸다.
 *여기서 gross amount란 계산한 총 금액을 뜻한다.

이 일련의 과정에서 중요하게 봐야 할 점은 uri에 포함되 argument이다. 중요한 argument 두 개가 바로 orderID와 gross amount이라고 할 수 있다.



flaw and exploit - attacker는 RT2.a 과정에서 argument로 전달되는 gross amount를 바꿨다. 예시에서는 $17.76를 $1.76으로 바꿨다고 나와있다. 그럼에도 불구하고 주문은 성공적으로 완료되었고, 심지어 주문서에는 $17.76 이 결제되었다고 떴다. 아마도 NopCommerce에서는 RT3.a.a, RT3.a.b 에서 주문이 완료되었는지 확인할 때 gross amount를 확인하지 않고 orderID로만 확인하는 모양이다. 또한, 구매 완료창을 RT3.b 에서 보내줄 때 RT3.a.b 에서 받은 gross amount가 아닌 데이터베이스에 존재하는 상품 가격을 쓰고 있을 가능성이 크다.



이 attack을 예방하는 방법은 아마도 RT3.a.b 에서 받은 orderID와 gross amount를 모두 검증하는 것이다. gross amount가 틀리면 주문 승인을 하지 않는 식으로 말이다.



그 외 모델들과 이를 공격하는 방식도 매우 흥미롭다. 사실 뒤로 갈 수록 더욱 더 복잡해진다. 예를 들자면 merchant에서 shopper에게 결제를 요구하기 위해 response로 주는 redirect URL을 shopper(attacker)가 만든 가상의 merchant의 주소로 바꿔치기 하는 것이다. 그런데 CaaS는 redirect URL은 확인하지 않고 orderID와 gross amount만 확인하기 때문에 결제가 되었다고 생각한다. 그리고 orderID에 대해 승인되었다고 merchant 에게 알린다.

그러니까 여기서 문제는, CaaS는 merchant1에게 "merchant2의 1234번 상품에 대해 결제를 승인했어" 라고 말했는데, merchant1은 당연히 자신의 상점에 있는 1234번 상품에 대한 내용이라고 생각하고 shopper에게 구매 완료를 승인해주는 것이다. 정작 shopper는 엉뚱한 merchant, 이를테면 자신이 등록한 merchant에게 지불했기 때문에 merchant1은 돈을 받지 못한다.


###### <a id="amamzonsdk"></a>
### Amazon SDK

Amazon은 CaaS의 일종이라고 볼 수 있다. merchant들은 자신의 쇼핑몰을 설계할 때 서버에 Amazon API를 이용하여 Amazon 구매 버튼을 설치할 수 있다. 그런데 여기서 merchant가 Amazon과 HTTP요청을 주고받을 때 Amazon으로부터 받은 request 또는 response가 맞는지 확인하기 위해 signature verification API라는 것을 사용한다.
간단하게 말하면, Amazon은 이런 url을 merchant에게 보낸다:

![image](https://user-images.githubusercontent.com/58674914/103989810-9bdf8b00-51d3-11eb-9922-fedd4fecab85.png){: width="20%" height="20%"}

여기서 certificate URL은 Amazon certificate server의 주소이고, 위에 달려 있는 C*은 Amazon이 sign 한 것으로 sign 된 uri는 외부의 attacker가 통신 과정에서 url 을 변경할 수 없다. 이 부분에 대해서 공부하는 중이지만 sign됐는지 알려면 헤더를 확인하면 되는 것 같다. Amazon certificate server 에서는 Amazon의 public key certificate을 제공한다.

그런데 문제는 C*을 아무도 검증하지 않는다는 것이다. 그러니까 attacker가 이렇게 새로운 url을 merchant에게 보냈을 때

![image](https://user-images.githubusercontent.com/58674914/103990293-4fe11600-51d4-11eb-8efb-97846d4488b3.png){: width="20%" height="20%"}

merchant는 https://cert.foo.com/PKICert.pem 이 Amazon certificate server라고 아무 의심 없이 받아들이게 된다.


이런 문제가 생긴 이유는 C* 를 검증할 때 certificate URL 이 가리키는 server에서 검증하기 때문이다. 말하자면 C* 를 검증하기 위해서는 Amazon certificate server에서 검증해야 하는데, 이 주소가 certificate URL 이니 여기서 검증하자는 것이다. 그런데 문제는 A* 을 검증할 때 attacker가 설정한 attacker의 server로 가서 A* 를 검증하면 당연히 아무 문제 없이 인증될 것이다.

Amazon certificate 이 인정이 되게 되면 merchant는 attacker가 보내는 url을 Amazon이 보내준 것으로 착각하게 된다. 그렇다면 결제 인증이 되었다는 url, 또는 해당 금액을 결제했다는 내용 등등 모두를 merchant는 아무런 의심 없이 믿게 된다.


###### <a id="closed_source"></a>
### Closed Sources

이 부분 같은 경우는 앞서 밝혀냈던 attack 수법들을 이용해서 attack할 수 있다는 것을 추측한다. 실제로 실험해본 결과 attack에 성공했다. 

Buy.com 같은 경우는 interspire의 PayPal Express에서와 경우가 비슷하다. 간단하게 설명하자면 OrderID를 바꿔치는 것인데, 두 개의 다른 브라우저에서 merchant 서버로 동시에 접속을 한다. 그리고 싼 상품을 결제한다. 그런데 결제 완료를 완전히 하기 위해서는 한 번 더 다른 페이지로 '결제완료'버튼을 누르고 shopper가 이동해야 하는데, 그러지 않고 결제창에 머물러 있는 것이다. 그리고 다른 비싼 상품의 결제창에 접속한다. 그러나 결제하지 않고 바로 결제 완료 버튼을 누르면, 결제 실패 등등의 메시지가 뜨겠지만 이 상품에 대한 orderID가 노출된다. 이렇게 획득한 orderID를 이전에 켜놓았던 싼 상품의 결제창의 orderID와 바꿔치기하고 '결제완료' 버튼을 누르면, merchant는 비싼 상품에 대해 구매가 완료되었다고 인식한다.

이런 문제가 생기는 이유는 merchant 측에서 특정 상품이 'paid' 되었다고 승인을 할 때 가장 최종 단계에서 하기 때문이다. 매 단계에서 검증을 하고 이 검증 과정을 모두 합해서 (and 논리연산으로) true 일 때 최종 승인을 해야 하는데, 각 단계에서 검증이 되었으면 다음 단계로 아무런 기록도 안 해두고 넘어가기 때문에 마지막 단계의 orderID만 바꿔치기해도 비싼 상품이 결제 되었다고 인식하는 것이다.

### Sum up

논문을 재미있게 읽은 것에 비해 정리한 글이 너무 적게 느껴지지만, 또 논문을 다시 쓰는 것처럼 설명하고 싶진 않기에 이만 마친다. 앞서 preview에서 밝혔던 'security invariant'를 매 단계 꼼꼼히 체크하는 것이 중요하다는 것을 느꼈고, 모든 과정을 검증하고 또 누적해두어야 최종 결제를 안전하게 할 수 있는 것 같다. 원리만 파악하고 있으면 정말 간단하게 uri의 argument 하나만 바꿔도 보안을 뚫을 수 있다는 게 멋있었다. 