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

    // 👇 YOU control how to dispatch success
    onSuccess(res, dispatch);

  } catch (err: any) {
    dispatch(actions.setError(err?.message || "Something went wrong"));
  }
};