var permission = function(exports, vueRouter2, Cookies2, pinia2) {
  "use strict";
  function getChildValue(data = [], arr = [], key = "", children = "children") {
    if (!key || data.length <= 0)
      return;
    data.forEach((item) => {
      if (item[children]) {
        getChildValue(item.children, arr, key, children);
      }
      arr.push(item[key]);
    });
  }
  function getRouteNames(data) {
    let menuNames = [];
    getChildValue((data == null ? void 0 : data.menu) || [], menuNames, "name", "children");
    data.menuNames = menuNames;
    return data;
  }
  const tokenkeys = {
    TOKEN_KEY: "_TOKEN__",
    OA_TOKEN_KEYS: ["SIAMTGT", "SIAMJWT"],
    LOCALE_KEY: "_LOCALE__",
    USER_INFO_KEY: "_USER__INFO__",
    USER_AUTHORITY_KEY: "_USER__AUTHORITY__",
    USER_ASYNC_ROUTE_KEY: "_USER_ASYNC_ROUTE_"
  };
  function setKeys(keyOptions) {
    if (keyOptions.token_key)
      tokenkeys.TOKEN_KEY = keyOptions.token_key;
    if (keyOptions.oa_token_keys)
      tokenkeys.OA_TOKEN_KEYS = keyOptions.oa_token_keys;
    if (keyOptions.locale_key)
      tokenkeys.LOCALE_KEY = keyOptions.locale_key;
    if (keyOptions.user_info_key)
      tokenkeys.USER_INFO_KEY = keyOptions.user_info_key;
    if (keyOptions.user_authority_key)
      tokenkeys.USER_AUTHORITY_KEY = keyOptions.user_authority_key;
    if (keyOptions.user_async_route_key) {
      tokenkeys.USER_ASYNC_ROUTE_KEY = keyOptions.user_async_route_key;
    }
  }
  const initRoute = async (app, options) => {
    const { publicPath, router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message } = options;
    const rOptions = { app, router, publicPath, asyncRoutes, basicRoutes };
    return await Promise.resolve().then(() => index$2).then(async (routerMethod) => {
      const routeInstance = routerMethod.setupRouter(rOptions);
      const guard = await Promise.resolve().then(() => index);
      const pOptions = { router: routeInstance, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message };
      guard.setupRouterGuard(pOptions);
    });
  };
  const initStore = async (app) => {
    await Promise.resolve().then(() => index$1).then(async (store2) => {
      await store2.setupStore(app);
    });
  };
  async function initPermission(app, options) {
    await initStore(app);
    await initRoute(app, options);
  }
  function toCreateRouter(publicPath, asyncRoutes, basicRoutes) {
    return vueRouter2.createRouter({
      // 创建一个 hash 历史记录。
      history: vueRouter2.createWebHashHistory(publicPath),
      // 应该添加到路由的初始路由列表。
      routes: [...asyncRoutes, ...basicRoutes]
    });
  }
  function hasRouteraBeenSetup(app) {
    return app.config.globalProperties.$router !== void 0;
  }
  function setupRouter(rOptions) {
    const { app, router, publicPath, asyncRoutes, basicRoutes } = rOptions;
    let route;
    if (!router && !hasRouteraBeenSetup(app)) {
      route = toCreateRouter(publicPath, asyncRoutes, basicRoutes);
      app.use(route);
    } else {
      route = router || app.config.globalProperties.$router;
      console.log("router has already been set up.");
    }
    return route;
  }
  const index$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    setupRouter,
    toCreateRouter
  }, Symbol.toStringTag, { value: "Module" }));
  const _Storage = class _Storage {
    /**
     * 获取 Cookies
     * @param key 
     * @returns 
     */
    static getCookies(key, params) {
      const value = Cookies2.get(key, params);
      if (value === void 0) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    /**
     * 设置 Cookies
     * @param key 
     * @param value 
     * @param options 
     */
    static setCookies(key, value, options) {
      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      return Cookies2.set(key, value, options);
    }
    /**
     * 移除 Cookies
     * @param key 
     * @param options 
     */
    static removeCookies(key, options) {
      Cookies2.remove(key, options);
    }
    /**
     * 清除 Cookies
     * @param key 
     * @param options 
     */
    static clearCookies() {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    }
    /**
    * * 存储本地会话数据
    * @param k 键名
    * @param v 键值（无需stringiiy）
    * @returns RemovableRef
    */
    static setLocalStorage(k, v) {
      try {
        window.localStorage.setItem(k, JSON.stringify(v));
      } catch (error) {
        return false;
      }
    }
    /**
     * * 获取本地会话数据
     * @param k 键名
     * @returns any
     */
    static getLocalStorage(k) {
      const item = window.localStorage.getItem(k);
      try {
        return item ? JSON.parse(item) : item;
      } catch (err) {
        return item;
      }
    }
    /**
     * * 清空所有本地会话数据
     * @param k 键名
     * @returns any
     */
    static clearLocalStorage() {
      try {
        return window.localStorage.clear();
      } catch (err) {
        return false;
      }
    }
    /**
     * * 存储临时会话数据
     * @param k 键名
     * @param v 键值
     * @returns RemovableRef
     */
    static setSessionStorage(k, v) {
      try {
        window.sessionStorage.setItem(k, JSON.stringify(v));
      } catch (error) {
        return false;
      }
    }
    /**
     * * 清除本地会话数据
     * @param name
     */
    static clearSessioStorage(name) {
      try {
        return name ? window.sessionStorage.removeItem(name) : window.sessionStorage.clear();
      } catch (err) {
        return false;
      }
    }
  };
  _Storage.getSessionStorage = (k) => {
    const item = window.sessionStorage.getItem(k);
    try {
      return item ? JSON.parse(item) : item;
    } catch (err) {
      return item;
    }
  };
  let Storage = _Storage;
  function getToken(key) {
    const setKey = key || tokenkeys.TOKEN_KEY;
    return Storage.getCookies(setKey);
  }
  function setToken(token) {
    return Storage.setCookies(tokenkeys.TOKEN_KEY, token);
  }
  function removeToken(domain) {
    removeOAToken(domain);
    return Storage.removeCookies(tokenkeys.TOKEN_KEY);
  }
  function getOAToken(domain) {
    let key = null;
    let oaToken = null;
    for (const keys of tokenkeys.OA_TOKEN_KEYS) {
      oaToken = Storage.getCookies(keys, {
        domain
      });
      if (oaToken) {
        key = keys;
        break;
      }
    }
    return {
      key,
      oaToken
    };
  }
  function removeOAToken(domain) {
    tokenkeys.OA_TOKEN_KEYS.forEach(
      (key) => Storage.removeCookies(key, {
        domain
      })
    );
  }
  function hasPiniaBeenSetup(app) {
    return app.config.globalProperties.$pinia !== void 0;
  }
  const store = pinia2.createPinia();
  function setupStore(app) {
    if (!hasPiniaBeenSetup(app)) {
      app.use(store);
    } else {
      console.log("Pinia has already been set up.");
    }
  }
  const index$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    setupStore,
    store
  }, Symbol.toStringTag, { value: "Module" }));
  function filterRoutes(routesInstans, routesMenuNames) {
    for (let i = 0; i < routesInstans.length; i++) {
      const route = routesInstans[i];
      if (route.children) {
        filterRoutes(route.children, routesMenuNames);
      }
      if (routesMenuNames && routesMenuNames.length > 0 && !(route == null ? void 0 : route.hidden)) {
        route.hidden = routesMenuNames.indexOf(route.name) < 0;
      }
    }
  }
  const useRoutesStore = pinia2.defineStore({
    id: "routes-store",
    state: () => ({
      routes: [],
      // 权限路由
      addRoutes: [],
      // 异步路由
      adminRoutes: [],
      //后台管理异步路由
      showRouters: {}
      // 后台管理-二级展示的路由
    }),
    getters: {
      // 所有路由
      getRoutes() {
        return this.routes;
      },
      // 异步路由
      getAddRoutes() {
        return this.addRoutes;
      },
      // 二级菜单展示路由
      getShowRouters() {
        return this.showRouters;
      }
    },
    actions: {
      // 设置侧边栏路由
      SetRoutes(asyncFilterRoutes, constantAsyncRoutes) {
        this.routes = constantAsyncRoutes.concat(asyncFilterRoutes).sort((value1, value2) => (value1 == null ? void 0 : value1.order) - (value2 == null ? void 0 : value2.order));
        this.addRoutes = asyncFilterRoutes;
        this.adminRoutes = asyncFilterRoutes.filter((route) => route.name === "AdminHome");
      },
      // 设置侧边栏路由
      SetRoute(routes) {
        this.routes = routes;
      },
      // 清空路由数据
      ClearRoute() {
        this.addRoutes = [];
        this.routes = [];
        this.showRouters = {};
      },
      // 生成异步路由
      GenerateRoutes(routesMenuNames, asyncRoutes, basicRoutes) {
        filterRoutes(basicRoutes, routesMenuNames);
        filterRoutes(asyncRoutes, routesMenuNames);
        this.SetRoutes(asyncRoutes, basicRoutes);
        return asyncRoutes;
      },
      /**
       * 设置二级菜单显示的路由
       * @param {} param0
       * @param {*} routes 当前路由对象，包含路由名称 name 或则路由路径
       * @returns
       */
      SetShowRouters(routes) {
        const { name, matched } = routes;
        let topRouteName = name;
        if (matched && matched.length > 0) {
          topRouteName = matched[0].name;
        }
        const filterRouter = this.routes.map((item) => {
          if (item.name !== topRouteName) {
            item.hidden = true;
          } else {
            item.hidden = false;
          }
          return item;
        });
        this.SetRoute(filterRouter);
        return routes;
      }
    }
  });
  function routesStoreWithOut() {
    return useRoutesStore(store);
  }
  const useUserStore = pinia2.defineStore({
    id: "user-store",
    state: () => ({
      authority: {
        menuNames: [],
        // 菜单权限名称列表
        rule: []
        // 按钮级别权限
      },
      // token
      token: void 0,
      expire: void 0,
      oa: {
        ticketName: null,
        ticketValue: null
      }
    }),
    getters: {
      getToken() {
        return getToken();
      },
      getAuthority() {
        return this.authority || {};
      }
    },
    actions: {
      SetToken(data) {
        const {
          oa = { ticketName: null, ticketValue: null },
          token = null
        } = data;
        this.token = token || "";
        this.oa = oa;
        setToken(token);
        if (oa.ticketName) {
          Storage.setCookies(oa.ticketName, oa.ticketValue);
        }
      },
      SetAuthority(authority) {
        this.authority = authority;
      },
      // 获取用户权限列表
      async GetAuthority(getAuthList, domain) {
        try {
          if (typeof getAuthList !== "function") {
            return Error("getAuthList 参数错误");
          }
          const authority = {
            menuNames: [],
            // 菜单权限名称列表
            rule: []
            // 按钮级别权限
          };
          const data = await getAuthList();
          authority.menuNames = data.menuNames;
          authority.rule = data.rule;
          this.SetAuthority(authority);
          return authority;
        } catch (error) {
          this.ClearLocal(domain);
          return null;
        }
      },
      // 使用 oa token 登录系统
      async CheckOaLogin(checkOaLogin, domain) {
        const { key, oaToken } = getOAToken(domain);
        if (!oaToken)
          return false;
        try {
          if (typeof checkOaLogin !== "function") {
            return Error("checkOaLogin 参数错误");
          }
          const data = await checkOaLogin({
            ticketName: key,
            ticketValue: oaToken
          });
          return data;
        } catch (error) {
          this.Logout(domain);
        }
      },
      // 退出
      async Logout(domain) {
        try {
        } catch (error) {
          console.error(error);
        } finally {
          this.ClearLocal(domain);
          location.hash = "/login";
        }
      },
      //清空存储数据
      ClearLocal(domain) {
        removeToken(domain);
        Storage.clearLocalStorage();
        Storage.clearSessioStorage();
        Storage.clearCookies();
      }
    }
  });
  function useUserStoreWithOut() {
    return useUserStore(store);
  }
  const routeStore = routesStoreWithOut();
  const userStore = useUserStoreWithOut();
  async function createPermissionGuard(router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message) {
    router.isReady().then(() => {
      router.beforeEach(async (to, from, next) => {
        if (getToken()) {
          return await routerPermission(to, from, next, whiteList, asyncRoutes, basicRoutes, getAuthList, domain, Message);
        } else {
          const { oaToken } = getOAToken(domain);
          if (oaToken) {
            try {
              await userStore.CheckOaLogin(checkOaLogin, domain);
              return next();
            } catch (err) {
              userStore.ClearLocal(domain);
              return next("/login?redirect=" + to.path);
            }
          } else if (whiteList.includes(to.name)) {
            return next();
          } else {
            return next("/login?redirect=" + to.path);
          }
        }
      });
    });
  }
  async function routerPermission(to, from, next, whiteList, asyncRoutes, basicRoutes, getAuthList, domain, Message) {
    if (to.path == "/login" && from) {
      if (from.path === "/login" || "/") {
        return next();
      } else {
        return next(from.path);
      }
    } else {
      const canAccess = await canUserAccess(to, whiteList, asyncRoutes, basicRoutes, getAuthList, domain);
      if (canAccess) {
        return next();
      } else {
        if (Message) {
          Message({
            message: "您没有权限访问页面,请联系系统管理员!",
            type: "warning"
          });
        } else {
          alert("您没有权限访问页面,请联系系统管理员!");
        }
        return false;
      }
    }
  }
  async function canUserAccess(to, whiteList, asyncRoutes, basicRoutes, getAuthList, domain) {
    var _a;
    if (!to || (to == null ? void 0 : to.name) === "Login")
      return false;
    try {
      let accessRoutes = userStore.getAuthority || {};
      if ((accessRoutes == null ? void 0 : accessRoutes.menuNames) && ((_a = accessRoutes == null ? void 0 : accessRoutes.menuNames) == null ? void 0 : _a.length) === 0) {
        accessRoutes = await userStore.GetAuthority(getAuthList, domain);
        routeStore.GenerateRoutes((accessRoutes == null ? void 0 : accessRoutes.menuNames) || [], asyncRoutes, basicRoutes);
      }
      const allRoutes = [...whiteList, ...accessRoutes == null ? void 0 : accessRoutes.menuNames];
      return allRoutes.length > 0 && allRoutes.includes(to.name);
    } catch (err) {
      userStore.Logout(domain);
      return false;
    }
  }
  async function setupRouterGuard(pOptions) {
    const { router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message } = pOptions;
    createPermissionGuard(router, whiteList, asyncRoutes, basicRoutes, getAuthList, checkOaLogin, domain, Message);
  }
  const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    setupRouterGuard
  }, Symbol.toStringTag, { value: "Module" }));
  exports.default = initPermission;
  exports.getRouteNames = getRouteNames;
  exports.setKeys = setKeys;
  exports.tokenkeys = tokenkeys;
  Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
  return exports;
}({}, vueRouter, Cookies, pinia);
