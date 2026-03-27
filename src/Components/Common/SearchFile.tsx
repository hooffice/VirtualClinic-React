export const handleSearchData = ({ setState, data, item }: any) => {
    setState(data.filter((search: any ) => {
        return Object.values(search).some(
            (field: any) =>
                typeof field === 'string' &&
                field?.toLowerCase().includes(item?.toLowerCase())
        )
    }
    ))
}