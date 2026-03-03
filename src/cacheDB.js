import Dexie from "dexie";

// 데이터베이스 인스턴스
const db = new Dexie("sand_hamster");

// db버전 정의. 스키마 같은게 변하면 버전을 올려야한다.
// stores에 테이블 이름과 인덱스를 걸 컬럼을 정해주면 된다.
db.version(1).stores({
  tag: "tag_id", // 여기에 적는다면 인덱스를 걸겠다는 의미. 인덱스를 걸지 않은 필드도 저장은 된다. where로 빠른검색하고싶다면 해야됨.
});

const tagCache = {
  getMaxId: () => db.tag.orderBy("tag_id").last(),
  add: (tag) => db.tag.add(tag),
  bulkAdd: (tags) => db.tag.bulkAdd(tags),
  getAllTagList: () => db.tag.toArray(),
};

export { tagCache };
