import { createPermissionGuard } from '@/router/guard/permissionGuard';
import type { PermissionGuardOptions } from "@/types/store";

// 定义一个接口来描述函数需要的参数对象  


// 使用接口作为函数参数的类型 
export function setupRouterGuard(pOptions: PermissionGuardOptions) {
    // 在函数体内，可以通过 options 对象来访问传入的参数  
    const { router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message } = pOptions;
    // 使用参数
    createPermissionGuard(router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message)
}
