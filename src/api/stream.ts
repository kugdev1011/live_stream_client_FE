import _ from 'lodash';
import { liveStreamApi } from './utils';
import { StreamInitializeFields } from '@/data/types/stream';
import {
  StreamDetailsResponse,
  StreamsResponse,
  VideosListRequest,
} from '@/data/dto/stream';
import {
  API_METHOD,
  ApiRequest,
  ApiResult,
  ApiService,
  FindAndCountResponse,
} from '@/data/api';
import { mapToQueryString } from '@/lib/utils';

const STREAM_API = '/streams';
const STREAM_INITIALIZE_API = STREAM_API + '/start';

export const apiInitializeStream = async ({
  title,
  description,
  categories,
  streamType,
  thumbnailImage,
}: StreamInitializeFields): Promise<ApiResult<StreamDetailsResponse>> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description || '');
  categories?.map((category) =>
    formData.append('category_ids', JSON.stringify(Number(category)))
  );
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

/**
 *
 * @param payload
 * @returns streams (live or ended) depending on passed payload
 */
export const apiFetchContents = async (
  payload: VideosListRequest
): Promise<ApiResult<FindAndCountResponse<StreamsResponse>>> => {
  const {
    page,
    limit,
    title,
    status,
    isMe,
    categoryId1,
    categoryId2,
    categoryId3,
  } = payload;
  const queryString = mapToQueryString<VideosListRequest>({
    page,
    limit,
    title,
    status,
    isMe,
  });

  const categoriesFilter = _.compact([categoryId1, categoryId2, categoryId3])
    ?.map((category) => `category_ids=${category}`)
    .join('&');

  const url = `${STREAM_API}?${queryString}${
    categoriesFilter ? `&${categoriesFilter}` : ''
  }`;

  const request: ApiRequest = {
    service: ApiService.liveStream,
    url,
    method: API_METHOD.GET,
    authToken: true,
  };

  const apiResponse = await liveStreamApi(request);
  const { success, data: responseData, code, message } = apiResponse;

  let rp: FindAndCountResponse<StreamsResponse> = {};
  if (success) {
    rp = responseData?.data;
  }

  return {
    data: rp,
    message,
    code,
  };
};
