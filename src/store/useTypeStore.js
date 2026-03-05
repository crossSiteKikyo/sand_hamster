import { create } from "zustand";
import { toast } from "react-toastify";
import typeApi from "../api/typeApi";

const useTypeStore = create((set) => ({
  typeList: [],
  getTypeList: async () => {
    let { data, error } = await typeApi.getTypeList();
    if (error) {
      toast(`타입 정보 가져오기 에러`);
    }
    if (data) set({ typeList: data });
    console.log(data);
  },
}));

export default useTypeStore;
