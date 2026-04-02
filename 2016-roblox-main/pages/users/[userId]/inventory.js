import { useRouter } from "next/router";
import UserInventory from "../../../components/userInventory";
import UserCollectibles from "../../../components/userCollectibles";

const UserInventoryPage = props => {
  const router = useRouter();
  const userId = router.query['userId'];
  const view = router.query['view'];

  if (view === 'collectibles') {
    return <UserCollectibles userId={userId} />
  }

  return <UserInventory userId={userId} mode='Inventory'/>
}

export default UserInventoryPage;
