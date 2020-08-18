# @mpkit/mixin

-   `MkApp(...appSpecList:MpAppSpec[]):MpAppSpec`
-   `MkPage(...pageSpecList:MpPageSpec[]):MpPageSpec`
-   `MkComponent(...componentSpecList:MpComponentSpec[]):MpComponentSpec`

将多个对象进行混入操作，并在合并方法时添加钩子函数，方便统一拦截，可使用`MixinStore.addHook`添加全局钩子；

```javascript
import { MkApp } from "@mpkit/mixin";
const appSpec = MkApp(
    {
        globalData: {
            user: {
                name: "Tom",
            },
        },
        onShow() {
            console.log("onShow1");
        },
    },
    {
        globalData: {
            user: {
                name: "Alice",
                age: 20,
            },
        },
        onShow() {
            console.log("onShow2");
        },
    }
);
console.log(appSpec);
/*
{
    globalData: { user: { name: 'Alice', age: 20 } },
    onLaunch: { [Function] displayName: 'onLaunch' },
    onShow: { [Function] displayName: 'onShow' }
}
*/
App(appSpec);
// 输出onShow1
// 输出onShow2
```

-   `MkApi`

与小程序原生的 Api 对象拥有的属性和方法一致，并在方法中添加了钩子函数，方便统一拦截，可使用`MixinStore.addHook`添加全局钩子；

```javascript
import { MkApi } from "@mpkit/mixin";
// 等同于wx.request | my.request | tt.request ...
const task = MkApi.request({
    url: "...",
    success(res) {
        console.log(res);
    },
});
task.abort();
```

-   `MixinStore`

    -   `addHook(type:MpViewType.App|MpViewType.Page|MpViewType.Component|'Api', hook:MpMethodHook)`

可调用`MixinStore.addHook`为 App/Page/Component/Api 添加全局钩子函数；

```typescript
interface MpMethodHookLike {
    before?(
        methodName: string,
        methodArgs: any[],
        methodHandler: Function,
        funId?: string
    );
    after?(
        methodName: string,
        methodArgs: any[],
        methodResult: any,
        funId?: string
    );
    catch?(
        methodName: string,
        methodArgs: any[],
        error: Error,
        errType?: string,
        funId?: string
    );
    complete?(
        methodName: string,
        methodArgs: any[],
        res: any,
        success?: boolean,
        funId?: string
    );
}
interface MpMethodHook extends MpMethodHookLike {
    [prop: string]: Function | MpMethodHookLike;
}
```

```javascript
import { MixinStore, MkApp, MkApi } from "@mpkit/mixin";
import { MpViewType } from "@mpkit/type";
MixinStore.addHook(MpViewType.App, {
    before(methodName, methodArgs) {
        console.log(`before methodName=${methodName}`);
    },
    after(methodName, methodArgs, methodResult) {
        console.log(`after methodName=${methodName}, ${methodResult}`);
    },
    catch(methodName, methodArgs, error) {
        console.log(`catch err=${error.message}`);
    },
});
App(
    MkApp({
        onLaunch() {
            this.add(1, 2);
        },
        onShow() {
            throw new Error("test");
        },
        add(a, b) {
            return a + b;
        },
    })
);
// 输出：before methodName=onLaunch
// 输出：before methodName=add
// 输出：after methodName=add, 2
// 输出：after methodName=onLaunch,
// 输出：before methodName=onShow,
// 输出：catch err=test

MixinStore.addHook("Api", {
    before(methodName, methodArgs, methodHandler, funId) {
        console.log(`before api=${methodName}`);
    },
    after(methodName, methodArgs, methodResult, funId) {
        console.log(`after api=${methodName}, ${methodResult}`);
    },
    complete(methodName, methodArgs, res, isSuccess, funId) {
        console.log(`complete api=${methodName}, ${isSuccess}, ${res}`);
    },
});
MkApi.request({
    url: "...",
});
// 输出：before api=request
// 输出：after api=request, [RequestTask Object]
// 假设请求成功且返回字符串“1”，则输出：complete api=request, true, 1
// 假设请求失败，则输出：complete api=request, false, { errMsg:'...' }
```

在调用`MixinStore.addHook`传递的`MpMethodHook`参数可以是：

-   包含`before/after/catch/complete`属性的对象
-   也可以是包含任意属性名，属性值是包含`before/after/catch/complete`的对象
    当属性名非`before/after/catch/complete`时，则会在调用钩子函数时，去`MpMethodHook`参数中寻找属性名是方法名的对象，如：

```javascript
MixinStore.addHook(MpViewType.App, {
    onShow: {
        before(methodName, methodArgs) {
            console.log(`before methodName=${methodName}`);
        },
    },
});
App(
    MkApp({
        onLaunch() {},
        onShow() {},
    })
);
// 仅输出：before methodName=onShow
```

另外：

-   为 App/Page/Component 添加钩子时，如果`MpMethodHook`中的`before`函数钩子返回`false`时，将不会执行方法体
-   为 Api 添加钩子时：
    -   如果`MpMethodHook`中的`before`函数钩子返回`false`时，将不会执行方法体
    -   如果`MpMethodHook`中的`before`函数钩子返回不为`true|undefined`时，将不会执行方法体，并将返回结果直接向外传递

```javascript
MixinStore.addHook(MpViewType.App, {
    onShow: {
        before(methodName, methodArgs) {
            console.log("hook onShow");
            return false;
        },
    },
});
App(
    MkApp({
        onLaunch() {},
        onShow() {
            console.log("self onShow");
        },
    })
);
// 仅输出：hook onShow

const store = {};
MixinStore.addHook("Api", {
    before(methodName, methodArgs, methodHandler, funId) {
        console.log(`before methodName=${methodName}`);
        if (methodName === "setStorageSync") {
            store[methodArgs[0]] = methodArgs[1];
        }
        if (methodName === "getStorageSync") {
            // 并不会真正执行(wx|my|tt|..).getStorageSync
            return store[methodArgs[0]];
        }
    },
    after(methodName) {
        console.log(`after methodName=${methodName}`);
    },
});
MkApi.setStorageSync("name", "Tom");
const name = MkApi.getStorageSync("name");
console.log(name === store.name);
// 输出：before methodName=setStorageSync
// 输出：after methodName=setStorageSync
// 输出：before methodName=getStorageSync
// 输出：true
```
