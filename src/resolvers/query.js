import { GraphQLError } from "graphql";
import { Category } from "../Allocation/Category/category2.js";

const Query = {
    category: async (parent, args, contextValue) => {
        if (! await Category._doesCategoryExist(args.categoryName)) {
            throw new GraphQLError('Category Does Not Exist', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                    argumentName: 'categoryName',
                }
            });
        }
    }
}

export default Query