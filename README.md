## 설치방법

`npm i -g json-server`로 json-server 글로벌 설치!

## 설치 후에

json-server가 db.json 파일을 watching 하도록 아래와 같이 실행한다. 

## 기본 포트(3000) 사용
$ json-server --watch db.json

리액트랑 포트가 겹쳐서 불편하다면 아래 명령어로 포트를 변경해서 실행할 수도 있어요.
## 포트 변경
$ json-server --watch db.json --port 5000

실행 후에 나온 주소로 접속해도 되고, 뭐가 뭔지 잘 모르겠다면
http://localhost:3000 
(혹은 변경된 포트로 접속하면 현재 만들어진 데이터 목록을 확인할 수 있습니다.)

##. API 접근 방법
```
  {"users": [{ "id": 1, "userid" : "testid1", "password" : "imhashed", "name": "김미애", "handphone" : "01012345678", "email" : "test@test.com" },
    { "id": 2, "userid" : "testid2", "password" : "imhashedtoo", "name": "발견왕", "handphone" : "01012345678", "email" : "test@test.com" }
  ]}
```
위의 user를 이용해서 설명합니다.

목록조회(GET) : http://localhost:3000/users
상세조회(GET) : http://localhost:3000/users/1
추가(POST) : http://localhost:3000/users
수정(PUT) : http://localhost:3000/users/1
삭제(DELETE) : http://localhost:3000/users/1
추가, 수정의 경우 body에 json 값이 들어가야 합니다.(ip주소를 이용할 수 있습니다.)

## 참조 

안 봐도 상관없지만 혹시 json에 대한 공부가 필요하다면?

POST로 보내서 데이터를 추가하거나, 삭제, 수정 하는 등의 방법이 나와있습니다.
https://redux-advanced.vlpt.us/3/01.html 

https://github.com/typicode/json-server 공식 사이트 

http://webframeworks.kr/tutorials/weplanet/How%20to%20Use%20json-server%20to%20Create%20Mock%20APIs1/ 그외...

http://webframeworks.kr/tutorials/weplanet/How%20to%20Use%20json-server%20to%20Create%20Mock%20APIs2/ JSON은 검색도 가능합니다! 여기서 적용할 수 있어요.

## JSON-SERVER의 한계점

json-server를 사용하는데 분명한 한계점들이 있습니다. 이러한 한계점은 다음과 같습니다.

텍스트 데이터와 관련된 프로토타입을 만들 때만 사용할 수 있습니다.

인증을 기반으로 API 영역에 한계를 설정할 수 없습니다.