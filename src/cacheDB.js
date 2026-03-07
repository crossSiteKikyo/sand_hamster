import Dexie from "dexie";

// 데이터베이스 인스턴스
const db = new Dexie("sand_hamster");

// db버전 정의. 스키마 같은게 변하면 버전을 올려야한다.
// stores에 테이블 이름과 인덱스를 걸 컬럼을 정해주면 된다.
db.version(5).stores({
  tag: "tag_id", // 여기에 적는다면 인덱스를 걸겠다는 의미. 인덱스를 걸지 않은 필드도 저장은 된다. where로 빠른검색하고싶다면 해야됨.
  gallery: "g_id, last_accessed_at",
  ranking: "[rank_type+period]", // rankType, period복합키로 생성.
});

const tagCache = {
  getMaxId: () => db.tag.orderBy("tag_id").last(),
  bulkAdd: (tags) => db.tag.bulkAdd(tags),
  getAllTagList: () => db.tag.toArray(),
};

const galleryCache = {
  get: (g_id) => db.gallery.get(g_id),
  // bultGet은 순서를 보장한다.
  bulkGet: (g_ids) => db.gallery.bulkGet(g_ids),
  bulkAdd: (galleryList) => db.gallery.bulkAdd(galleryList),
  bulkPut: (galleryList) => db.gallery.bulkPut(galleryList),
  // updateLastAccessedAt: (g_ids) =>
  //   db.gallery
  //     .where("g_id")
  //     .anyOf(g_ids)
  //     .modify({ last_accessed_at: Date.now() }),
  updateViewCountAndLastAccessedAt: (data) =>
    db.gallery.bulkUpdate(
      data.map((d) => ({
        key: d.g_id,
        changes: { view_count: d.view_count, last_accessed_at: Date.now() },
      })),
    ),
  cleanOldCache: async () => {
    const threeMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 30 * 3;
    return db.gallery.where("last_accessed_at").below(threeMonthsAgo).delete();
  },
};

const rankCache = {
  get: (rank_type, period) => db.ranking.get([rank_type, period]),
  put: (row) => db.ranking.put(row),
};

export { tagCache, galleryCache, rankCache };
