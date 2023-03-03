import { Category as CategoryC } from "../Allocation/Category/category2.js";

const Category = {
    assets: (parent, args, contextValue) => {
        return CategoryC.viewCategoryAssets(args.categoryName).then((res) => {
            return res;
        }).catch((err) => {
            /**
             * @todo add some error handling here
             */
            return []
        })
    }
};

export default Category;