import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from '@apollo/server/errors';

/**
 * @name Some Cool Errors by 
 */
export const Errors = {
    "1": "Category Does Not Exist",
    "2": 'Oops Something Went Wrong',
    "3": "Asset Does not Exist"
}

export const GraphQLInternalServerError = new GraphQLError(Errors[2], {
    extensions: {
        code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR
    }
});


