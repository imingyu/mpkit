# @mpkit/set-data

-   将对象的 key 展开：`openMpData(data:any, view?:MpView)`

```javascript
import { openMpData } from "@mpkit/set-data";
const res = openMpData({
    "list[0].user.name": "Tom",
});
console.log(res);
/*
{
    list:[
        user:{
            name:'Tom'
        }
    ]
}
*/
```

-   对比两个对象，返回对比后的结果：`diffMpData(source:any,target:any)`

```javascript
import { diffMpData } from "@mpkit/set-data";
const res = diffMpData(
    {
        data: 1,
        list: [
            {
                user: {
                    name: "Tom",
                },
            },
            {
                user: {
                    name: "Jeck",
                },
            },
        ],
    },
    {
        data: 2,
        list: [
            {
                user: {
                    name: "Alice",
                    age: 10,
                },
            },
        ],
    }
);
console.log(res);
/*
{
    "data": 2,
    "list[0]['user']['name']": "Alice",
    "list[0]['user']['age']": 10
}
*/
```
