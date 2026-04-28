export const handleAsync = async <TResponse>(
  dispatch: any,
  apiCall: () => Promise<TResponse>,
  actions: {
    setLoading?: () => any;
    setSaving?: () => any;
    setError: (msg: string) => any;
  },
  onSuccess: (res: TResponse, dispatch: any) => void
) => {
  try {
    if (actions.setSaving) {
      dispatch(actions.setSaving());
    } else if (actions.setLoading) {
      dispatch(actions.setLoading());
    }

    const res = await apiCall();
    onSuccess(res, dispatch);

  } catch (err: any) {
    // Better error handling
    const errorMessage = 
      typeof err === 'string' 
        ? err 
        : err?.response?.data?.message || err?.message || "Something went wrong";
    
    dispatch(actions.setError(errorMessage));
    
  } 
};