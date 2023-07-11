export default function PageBlogs() {
  return (
    <div>
      <h1>Page Blogs</h1>
    </div>
  );
}

export async function getServerSideProps() {
  await new Promise((resolve) => {
    setTimeout(resolve, 5000);
  });

  return {
    props: {},
  };
}
