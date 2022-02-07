import { acceptHMRUpdate, defineStore } from 'pinia';
import { User } from '~/models/user';

export const useUserStore = defineStore("user", () => {
    const token = useStorage("TOKEN", "");
    const userInfo = useStorage("USERINFO", {});

    const isLoading = ref(false);

    const isLoggedIn = computed(() => {
        return token.value !== "";
    });

    function setUserInfo(user: User) {
        userInfo.value = user;
    }

    function setToken(t: string) {
        token.value = t;
    }

    function invalidateToken() {
        setToken("");
    }

    function setIsLoading(l: boolean) {
        isLoading.value = l;
    }

    function clear() {
        userInfo.value = {};
        token.value = "";
    }

    return {
        token,
        isLoggedIn,
        userInfo,
        setToken,
        invalidateToken,
        setIsLoading,
        setUserInfo,
        clear,
    };
});

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))