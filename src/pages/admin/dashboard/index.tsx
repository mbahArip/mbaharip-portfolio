import { AxiosError } from 'axios';
import useSWR from 'swr';

import ErrorPage from 'components/Error';
import NanashiLayout from 'components/Layout/774AdminLayout';

import {
  DataAttachments,
  DataComments,
  DataInbox,
  DataPostsRank,
  DataReported,
  DataStats,
  DataTotalPosts,
} from 'mod/admin/dashboard';

import { swrFetcher } from 'utils/swr';

import { ApiResponseError, ApiResponseSuccess } from 'types/Common';

import { APIDashboardResponse } from '../../api/admin/dashboard';

export default function AdminDashboard() {
  const { data, error, isLoading } = useSWR<ApiResponseSuccess<APIDashboardResponse>, AxiosError<ApiResponseError>>(
    '/api/admin/dashboard',
    swrFetcher,
  );

  if (error) {
    console.error(error);
    return (
      <ErrorPage
        status={error.response?.status ?? 500}
        code={error.code}
        name={error.name}
        message={error.message}
      />
    );
  }

  return (
    <NanashiLayout
      key={'admin'}
      seo={{
        title: 'Dashboard',
      }}
      header={{
        title: 'Dashboard',
        subtitle: 'Overview of the site',
      }}
    >
      {data && (
        <div className='grid w-full grid-cols-4 gap-4'>
          <DataTotalPosts
            data={data.data.totalPostsPerCategory || []}
            isLoading={isLoading}
          />
          <DataStats
            data={
              data.data.statsData || {
                category: 0,
                tags: 0,
              }
            }
            isLoading={isLoading}
          />
          <DataAttachments
            data={data.data.latestAttachmentsData || []}
            isLoading={isLoading}
          />
          <DataPostsRank
            data={data.data.postsRankData || []}
            isLoading={isLoading}
          />
          <DataComments
            data={data.data.latestCommentsData || []}
            isLoading={isLoading}
          />
          <DataReported
            data={data.data.latestReportData || []}
            isLoading={isLoading}
          />
          <DataInbox
            data={data.data.latestMailData || []}
            isLoading={isLoading}
          />
        </div>
      )}
    </NanashiLayout>
  );
}
