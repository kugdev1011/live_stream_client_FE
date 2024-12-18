import { liveStreamApi } from './utils';
import { StreamInitializeFields } from '@/data/types/stream';
import { StreamDetailsResponse } from '@/data/dto/stream';
import { API_METHOD, ApiRequest, ApiResult, ApiService } from '@/data/api';

const STREAM_API = '/streams';
const STREAM_INITIALIZE_API = STREAM_API + '/start';

export const apiInitializeStream = async ({
  title,
  description,
  streamType,
  thumbnailImage,
}: StreamInitializeFields): Promise<ApiResult<StreamDetailsResponse>> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  formData.append('stream_type', streamType);
  formData.append('thumbnail', thumbnailImage || '');

  const request: ApiRequest = {
    service: ApiService.liveStream,
    url: STREAM_INITIALIZE_API,
    method: API_METHOD.POST,
    data: formData,
    authToken: true,
  };

  const apiResponse = await liveStreamApi(request);
  const { success, data: responseData, code, message } = apiResponse;

  let rp: StreamDetailsResponse = {} as StreamDetailsResponse;
  if (success) {
    rp = responseData?.data;
  }

  return {
    data: rp,
    message,
    code,
  };
};
