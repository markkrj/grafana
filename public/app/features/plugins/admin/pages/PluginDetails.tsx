import { css } from '@emotion/css';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, TabContent, Alert } from '@grafana/ui';
import { Layout } from '@grafana/ui/src/components/Layout/Layout';
import { Page } from 'app/core/components/Page/Page';
import { AppNotificationSeverity } from 'app/types';

import { Loader } from '../components/Loader';
import { PluginDetailsBody } from '../components/PluginDetailsBody';
import { PluginDetailsDisabledError } from '../components/PluginDetailsDisabledError';
import { PluginDetailsSignature } from '../components/PluginDetailsSignature';
import { usePluginDetailsTabs } from '../hooks/usePluginDetailsTabs';
import { usePluginPageExtensions } from '../hooks/usePluginPageExtensions';
import { useGetSingle, useFetchStatus, useFetchDetailsStatus } from '../state/hooks';
import { PluginTabIds } from '../types';

export default function PluginDetails(): JSX.Element {
  const { pluginId } = useParams<{ pluginId: string }>();
  const location = useLocation();
  const parentUrl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
  const queryParams = new URLSearchParams(location.search);
  const plugin = useGetSingle(pluginId); // fetches the plugin settings for this Grafana instance
  const { navModel, activePageId } = usePluginDetailsTabs(plugin, queryParams.get('page') as PluginTabIds);
  const { actions, info, subtitle } = usePluginPageExtensions(plugin);
  const { isLoading: isFetchLoading } = useFetchStatus();
  const { isLoading: isFetchDetailsLoading } = useFetchDetailsStatus();
  const styles = useStyles2(getStyles);

  if (isFetchLoading || isFetchDetailsLoading) {
    return (
      <Page navId="plugins">
        <Loader />
      </Page>
    );
  }

  if (!plugin) {
    return (
      <Layout justify="center" align="center">
        <Alert severity={AppNotificationSeverity.Warning} title="Plugin not found">
          That plugin cannot be found. Please check the url is correct or <br />
          go to the <a href={parentUrl}>plugin catalog</a>.
        </Alert>
      </Layout>
    );
  }

  return (
    <Page navId="plugins" pageNav={navModel} actions={actions} subTitle={subtitle} info={info}>
      <Page.Contents>
        <TabContent className={styles.tabContent}>
          <PluginDetailsSignature plugin={plugin} className={styles.alert} />
          <PluginDetailsDisabledError plugin={plugin} className={styles.alert} />
          <PluginDetailsBody queryParams={Object.fromEntries(queryParams)} plugin={plugin} pageId={activePageId} />
        </TabContent>
      </Page.Contents>
    </Page>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    alert: css`
      margin-bottom: ${theme.spacing(2)};
    `,
    subtitle: css`
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing(1)};
    `,
    // Needed due to block formatting context
    tabContent: css`
      overflow: auto;
      height: 100%;
    `,
  };
};
