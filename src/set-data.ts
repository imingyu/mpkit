export default (view, data: any, callback?: Function): Promise<void> => {
    return view.setData(data, callback);
};
