import NanashiLayout from 'components/Layout/774AdminLayout';

export default function Test() {
  return (
    <NanashiLayout
      seo={{
        title: 'title',
      }}
      header={{
        title: 'Dashboard',
      }}
    >
      Children
    </NanashiLayout>
  );
}
