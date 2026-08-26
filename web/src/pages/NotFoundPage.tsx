import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="not-found-panel panel">
      <EmptyState
        icon={<Compass size={22} />}
        title="페이지를 찾을 수 없습니다."
        description="주소가 잘못되었거나 삭제된 페이지일 수 있어요."
        action={
          <Link to="/">
            <Button>대시보드로 이동</Button>
          </Link>
        }
      />
    </div>
  );
}
