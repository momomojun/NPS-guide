// 测试用：Node 24 能直接跑 TypeScript（自带去掉类型），这里再补上项目里的两种写法：
// 不写扩展名的相对路径（"./planner"）和 @/ 别名。npm test 用 --import 先加载这个文件
import { register } from "node:module";

register("./resolve.mjs", import.meta.url);
