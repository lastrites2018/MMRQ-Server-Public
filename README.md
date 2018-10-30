
npm i -g json-server로 json-server 글로벌 설치!

설치가 완료됐으면

json-server가 db.json 파일을 watching하도록 실행한다. 기본 포트는 3000 입니다.
리액트랑 포트가 겹쳐서 불편하다면 아래 명령어로 포트를 변경해서 실행할 수도 있어요.

## 기본 포트(3000) 사용
$ json-server --watch db.json
## 포트 변경
$ json-server --watch db.json --port 5000

실행 후에 나온 주소로 접속해도 되고, 뭐가 뭔지 잘 모르겠다면
http://localhost:3000 
(혹은 변경된 포트로 접속하면 현재 만들어진 데이터 목록을 확인할 수 있습니다.)

## 참조 (안 봐도 상관없지만 혹시 json에 대한 공부가 필요하다면?)
POST로 보내서 데이터를 추가하거나, 삭제, 수정 하는 등의 방법이 나와있습니다.
https://redux-advanced.vlpt.us/3/01.html 

https://github.com/typicode/json-server 공식 사이트 

http://webframeworks.kr/tutorials/weplanet/How%20to%20Use%20json-server%20to%20Create%20Mock%20APIs1/ 그외...

http://webframeworks.kr/tutorials/weplanet/How%20to%20Use%20json-server%20to%20Create%20Mock%20APIs2/ JSON은 검색도 가능합니다! 여기서 적용할 수 있어요.


## 주의사항
json-server를 사용하는데 분명한 한계점들이 있습니다. 이러한 한계점은 다음과 같습니다.

텍스트 데이터와 관련된프로토타입을 만들 때만 사용할 수 있습니다.
인증을 기반으로 API 영역에 한계를 설정할 수 없습니다.