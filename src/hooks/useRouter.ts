import { useNavigate, useLocation, useParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    push: (path: string) => {
      console.log(`[Router] Navigating to: ${path}`);
      navigate(path);
    },
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    pathname: location.pathname,
    query: params,
  };
}
