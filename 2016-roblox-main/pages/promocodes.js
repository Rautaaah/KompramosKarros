import PromocodesPage from "../components/promocodesPage";

const Page = () => {
  return <PromocodesPage />;
}

export async function getServerSideProps() {
  return {
    props: {
      title: 'Promocodes - Zekoro',
    },
  };
}

export default Page;
