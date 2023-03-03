import { Category } from "../Allocation/Category/category2.js";
import { GraphQLInternalServerError } from '../../utility/constants.js';
import Asset from "../Allocation/Asset/asset2.js";

const Query = {
    category: (parent, args, contextValue) => {
            return Category._doesCategoryExist(args.name).then(async (data) => {
                if (!data) {
                    return {
                        message: `Category ${args.name} Does Not Exist`,
                    };
                }else{
                    return await Category.getCategory(args.name).then((data) => {
                        console.log(`This is the shit::`, data)
                        return data
                    }).catch((e) => {
                        return {
                            message: "Category couldnt be gotten"
                        }
                    })
                }
            }).catch((e) => {
                return {
                    message: "Some fucked up issue occured here"
                }
            })
    },
    asset_resolver: (parent, args, contextValue) => {
        console.log("Some stuff is stuff")
        return Asset.get_asset_details(args.asset_tag).then((data)=>{
            console.log("Ad astra is shit:::", data)
            return data
        }).catch((e)=>{
            console.log("e", e)
            return {
                message:  e
            }
        })
    }
}

export default Query