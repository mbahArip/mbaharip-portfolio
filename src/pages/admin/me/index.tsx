import AdminLayout from 'components/Layout/AdminLayout';

export default function AdminMe() {
  return (
    <AdminLayout
      seo={{
        title: 'Me',
      }}
      icon='UserCog'
    >
      <h1>Me</h1>
    </AdminLayout>
  );
}
