import { acceptHMRUpdate, defineStore } from 'pinia';
import {useUserStore} from "~/stores/user";

export const useGlobalStore = defineStore('global', ()=>{
    const backendUrl = ref('http://shuwashuwa.kinami.cc:8848');
    const token = ref('');

    const isTokenValid = computed(()=>{
        return token.value !== '';
    });

    function setBackendUrl(url: string) {
        backendUrl.value = url;
    }

    function setToken(tok: string) {
        token.value = tok;
    }

    return {
        backendUrl,
        setBackendUrl,
        token,
        setToken,
        isTokenValid,
    };
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))