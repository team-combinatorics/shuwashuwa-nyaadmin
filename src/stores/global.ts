import { acceptHMRUpdate, defineStore } from 'pinia';
import { Ref } from 'vue';

export const useGlobalStore = defineStore('global', () => {
    // global consts
    const prodUrl = import.meta.env.VITE_PROD_URL as string;
    const devUrl = import.meta.env.VITE_DEV_URL as string;

    // make it persistant
    const backendUrl: Ref<String> = useStorage('BACKENDURL', '/');
    const env = useStorage('ENV', 'custom') as Ref<"custom" | "prod" | "dev">;

    function setBackendUrl(url: string) {
        console.log(`set backend url to ${url}`);
        backendUrl.value = url;
        env.value = "custom";
    }

    function setProdUrl(){
        console.log(`set backend url to ${prodUrl}`);
        backendUrl.value = prodUrl;
        env.value = "prod";
    }

    function setDevUrl(){
        console.log(`set backend url to ${devUrl}`);
        backendUrl.value = devUrl;
        env.value = "dev";
    }

    return {
        env,
        backendUrl,
        setBackendUrl,
        setProdUrl,
        setDevUrl,
    };
});

if (import.meta.hot)
    import.meta.hot.accept(acceptHMRUpdate(useGlobalStore, import.meta.hot))