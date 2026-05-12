import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import BundleList from './components/bundle-list';
import BundleEditor from './components/bundle-editor';

type ApplicationRoutesProps = {
  children?: ReactNode;
};

const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();

  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route exact path={`${match.path}/new`}>
          <BundleEditor isNew />
        </Route>
        <Route path={`${match.path}/:bundleKey`}>
          <BundleEditor isNew={false} />
        </Route>
        <Route exact path={match.path}>
          <BundleList />
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};

ApplicationRoutes.displayName = 'ApplicationRoutes';
export default ApplicationRoutes;
