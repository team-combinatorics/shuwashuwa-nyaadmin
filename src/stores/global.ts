import { acceptHMRUpdate, defineStore } from 'pinia';
import { Ref } from 'vue';

export const useGlobalStore = defineStore('global', () => {
    const backendUrl: Ref = ref(import.meta.env.BASE_URL);
    const token: Ref = ref('');

    const isTokenValid = computed(() => {
        return token.value !== '';
    });

    function setBackendUrl(url: string) {
        backendUrl.value = url;
    }

    function setToken(tok: string) {
        token.value = tok;
    }

    function invalidateToken(){
        setToken('');
    }

    return {
        backendUrl,
        setBackendUrl,
        token,
        setToken,
        isTokenValid,
        invalidateToken
    };
})

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot))