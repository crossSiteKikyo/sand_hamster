import { Link } from "react-router-dom";

export default function FirstPage() {
  return (
    <div className="p-10 bg-white dark:bg-black flex flex-col grow items-center justify-center">
      <img
        src="https://i.namu.wiki/i/vuilaXbYQcXXbOzw5dx25apTIvdsIovqWkwyYg9MeR3SAbQWJOVTm6jWu7E_09gKKCtaRpvNGiAFGn_hS9wHHCE7xNjUrQXDpYlnIwjLB9Xi5JCt9yLE2jaMFlRR5s7jz35Y0DF9g5-4TxisCA7cPg.svg"
        className="w-30"
      />
      <div className="flex flex-col text-center font-extrabold text-xl m-2">
        <p>이 정보내용은 청소년 유해매체물로서 정보통신망</p>
        <p>이용촉진 및 정보보호 등에 관한 법률 및 청소년 보호법의</p>
        <p>규정에 의하여 19세 미만의 청소년이 이용할 수 없습니다.</p>
      </div>
      <div className="flex flex-col text-center m-2">
        <p>
          본 웹사이트에는 19세 이상 전용의 성인 콘텐츠(성인 만화 등)가 포함되어
          있습니다.
        </p>
        <p>
          이용자는 "19세 이상 성인입니다" 버튼을 클릭함으로써, 본인이 19세
          이상이거나
        </p>
        <p>
          현지법상 성인임을 확인하고 해당 콘텐츠 이용에 동의하는 것으로
          간주됩니다.
        </p>
      </div>
      <Link to="/list" className="bg-cyan-500 rounded-2xl p-2 m-2 border">
        19세 이상 성인입니다
      </Link>
      <Link to="/list" className="rounded-2xl p-2 m-2 border">
        19세 미만 나가기
      </Link>
    </div>
  );
}
