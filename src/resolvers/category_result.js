const CategoryResult = {
    __resolveType: object => {
        if (object.message) {
            return "DoesNotExist";
        }

        if (object.name) {
            return "Category"
        }

        return null;
    }
}

export default CategoryResult;