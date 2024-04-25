
import type { Router, RouteItem } from 'vue-router';
import { getToken, getOAToken, getOALoginToken } from "@/utils/token";
// import { whiteList } from '@/router' //改成外部传入的自定义白名单
import { ElMessage } from "element-plus";
import { routesStoreWithOut } from "@/store/routes";
import { useUserStoreWithOut } from "@/store/user";
import type { AppRouteModule } from "@/utils/types";

const routeStore = routesStoreWithOut();
const userStore = useUserStoreWithOut()


export function createPermissionGuard(
    router: Router,
    whiteList: string[],
    asyncRoutes: AppRouteModule[],
    basicRoutes: AppRouteModule[]
) {
    /**
     * 问题： 直接使用 router.beforeEach 会导致在刷新页面时无法进入 router.beforeEach 的回调函数
     * 原因：可能是因为在刷新页面时，Vue Router 的初始化过程尚未完成，导致路由守卫无法正常触发。
     * 解决方案：将 router.beforeEach 回调函数的逻辑放在一个异步函数中，并在 Vue Router 初始化完成后再调用这个异步函数。你可以使用 router.isReady() 方法来判断 Vue Router 是否已经初始化完成。
     * isReady: isReady(): Promise<void> 返回一个 Promise，它会在路由器完成初始导航之后被解析，也就是说这时所有和初始路由有关联的异步入口钩子和异步组件都已经被解析。如果初始导航已经发生，则该 Promise 会被立刻解析。
     */
    router.isReady().then(() => {

        router.beforeEach(async (to, from, next) => {
            if (getToken()) {
                return await routerPermission(to, from, next, whiteList, asyncRoutes, basicRoutes)
            } else {
                // 获取 oa 中的 token
                const { oaToken } = getOAToken()

                if (oaToken) { // oa 存在 token，用户已经登录 oa
                    try {
                        // 使用 oa token 登录系统
                        await userStore.CheckOaLogin();
                        // 获取新 oa token:LtpaToken, 通过创建 iframe,重定向获取 oa 登录 token
                        await getOALoginToken()
                        return next();
                    } catch (err) {
                        userStore.ClearLocal();
                        return next("/login?redirect=" + to.path);

                    }
                } else if (whiteList.includes(to.name as string)) {            // 用户未登录
                    return next();
                } else {
                    return next("/login?redirect=" + to.path);
                }
            }

        });
    });

}


/**
 * 路由权限判断函数,根据路由权限进入不同路由
 */
export async function routerPermission(
    to: RouteItem,
    from: RouteItem,
    next: Function,
    whiteList: String[],
    asyncRoutes: AppRouteModule[],
    basicRoutes: AppRouteModule[]
) {

    // 已经存在 token, 进入用户登录页面
    if (to.path == '/login' && from) {
        // 从登录页面进入，直接进入登录页面
        if (from.path === '/login' || '/') {
            return next();
        } else {
            //已经存在 token, 从其他页面进入用户登录页面，直接返回来源页面
            return next(from.path);
        }
    } else {
        const canAccess = await canUserAccess(to, whiteList, asyncRoutes, basicRoutes)
        if (canAccess) {
            return next()
        } else {
            ElMessage({
                message: "您没有权限访问页面,请联系系统管理员!",
                type: "warning",
            });
            return false
        }
    }
}





/**
* 获取异步权限
* @param to 
* @returns 
*/
export async function canUserAccess(
    to: RouteItem,
    whiteList: String[],
    asyncRoutes: AppRouteModule[],
    basicRoutes: AppRouteModule[]
) {
    if (!to || to?.name === "Login") return false
    try {
        let accessRoutes = userStore.getAuthority || {}
        if (accessRoutes?.menuNames && accessRoutes?.menuNames?.length === 0) {
            accessRoutes = await userStore.GetAuthority()
            routeStore.GenerateRoutes(accessRoutes?.menuNames || [], asyncRoutes, basicRoutes)
        }
        const allRoutes = [...whiteList, ...accessRoutes?.menuNames]
        return allRoutes.length > 0 && allRoutes.includes(to.name)
    } catch (err) {
        userStore.Logout()
        return false
    }

}

