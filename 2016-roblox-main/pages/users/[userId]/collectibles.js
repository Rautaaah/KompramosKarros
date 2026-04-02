import { useRouter } from "next/router";
import UserCollectibles from "../../../components/userCollectibles";

const UserCollectiblesPage = () => {
  const router = useRouter();
  const userId = router.query['userId'];

  return <UserCollectibles userId={userId} />;
};

export default UserCollectiblesPage;
