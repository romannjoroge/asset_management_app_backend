import { MyErrors2 } from "./constants.js";
import MyError from "./myError.js";
export default function handleError(err) {
    if (err instanceof MyError) {
        return { errorMessage: err.message, errorCode: 400 };
    }
    else {
        return { errorMessage: MyErrors2.INTERNAL_SERVER_ERROR, errorCode: 500 };
    }
}
//# sourceMappingURL=handleError.js.map