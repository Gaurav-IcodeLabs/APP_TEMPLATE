import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import defaultConfig from '../../config/configDefault';
import { denormalizeAssetData, mergeConfig, storableError } from '../../util';
import * as log from '../../util/log';
import { RootState } from '../store';
import { StorableError } from '../../types/api/api.types';
import {
  CategoryConfiguration,
  GoogleSearchConsoleConfig,
  ListingConfig,
  LocalizationConfig,
  MapsConfig,
  SearchConfig,
  UserFieldConfigItem,
  UserTypeConfigItem,
} from '../../types/config';
import { Assets } from '../../types/api/assets.types';

interface Thunk {
  state: RootState;
  extra: any;
}

export type AssetsThunkResponse = {
  assets: Assets & {
    listingTypes: {
      path: '/listings/listing-types.json';
      data: {
        listingTypes: ListingConfig['listingTypes'];
      };
    };
    listingFields: {
      path: '/listings/listing-fields.json';
      data: {
        listingFields: ListingConfig['listingFields'];
      };
    };
    search: {
      path: '/listings/listing-search.json';
      data: SearchConfig;
    };
    transactionSize: {
      path: '/transactions/minimum-transaction-size.json';
      data: {
        listingMinimumPrice: {
          amount: number;
          type: string;
        };
      };
    };
    analytics: {
      path: '/integrations/analytics.json';
    };
    googleSearchConsole: {
      path: '/integrations/google-search-console.json';
      data: GoogleSearchConsoleConfig;
    };
    maps: {
      path: '/integrations/map.json';
      data: MapsConfig[];
    };
    categories: {
      path: '/listings/listing-categories.json';
      data: CategoryConfiguration;
    };
    localization: {
      path: '/general/localization.json';
      data: LocalizationConfig;
    };
    userTypes: {
      path: '/users/user-types.json';
      data: {
        userTypes: UserTypeConfigItem[];
      };
    };
    userFields: {
      path: '/users/user-fields.json';
      data: {
        userFields: UserFieldConfigItem[];
      };
    };
  };
  version: string | null;
  googleAnalyticsId: string | null;
};

export interface AssetSliceData {
  // appAssets: Record<string, string>;
  // pageAssetsData: Record<string, any> | null;
  // currentPageAssets: string[];
  hostedConfig?: Omit<AssetsThunkResponse['assets'], 'translations'>;
  hostedTranslations?: AssetsThunkResponse['assets']['translations']['data'];
  version: string | null;
  inProgress: boolean;
  error: StorableError | null;
  translations?: Record<string, any>;
  googleAnalyticsId?: string | null;
}

const initialState: AssetSliceData = {
  // Current version of the saved asset.
  // Typically, the version that is returned by the "latest" alias.
  version: null,
  inProgress: false,
  error: null,
};

const pickHostedConfigPaths = (
  assetEntries: [string, string][],
  excludeAssetNames: string[],
) => {
  return assetEntries.reduce((pickedPaths: string[], [name, path]) => {
    if (excludeAssetNames.includes(name)) {
      return pickedPaths;
    }
    return [...pickedPaths, path];
  }, []);
};

const getFirstAssetData = (response: any) =>
  response?.data?.data[0]?.attributes?.data;
const getMultiAssetData = (response: any) => response?.data?.data;
const getMultiAssetIncluded = (response: any) => response?.data?.included;
const findJSONAsset = (assets: any, absolutePath: string) =>
  assets.find(
    (a: any) =>
      a.type === 'jsonAsset' && a.attributes.assetPath === absolutePath,
  );
const getAbsolutePath = (path: string) =>
  path.charAt(0) !== '/' ? `/${path}` : path;

const getGoogleAnalyticsId = (configAssets: any, path: string) => {
  if (!configAssets || !path) {
    return null;
  }
  const configAssetsData = getMultiAssetData(configAssets);
  const jsonAsset = findJSONAsset(configAssetsData, getAbsolutePath(path));
  const { enabled, measurementId } =
    jsonAsset?.attributes?.data?.googleAnalytics || {};
  return enabled ? measurementId : null;
};

export const fetchAppAssets = createAsyncThunk<
  AssetsThunkResponse,
  void,
  Thunk
>(
  'hostedAssets/fetchAppAssets',
  async (_, { getState, extra: sdk, rejectWithValue }) => {
    const assets = defaultConfig.appCdnAssets;
    const version = getState().hostedAssets.version;

    // App-wide assets include 2 content assets: translations for microcopy and footer
    const translationsPath = assets.translations;
    const footerPath = assets.footer;

    // The rest of the assets are considered as configurations
    const assetEntries = Object.entries(assets);
    const nonConfigAssets = ['translations', 'footer'];
    const configPaths = pickHostedConfigPaths(assetEntries, nonConfigAssets);

    // If version is given fetch assets by the version,
    // otherwise default to "latest" alias
    const fetchAssets = (paths: string[]) =>
      version
        ? sdk.assetsByVersion({ paths, version })
        : sdk.assetsByAlias({ paths, alias: 'latest' });

    const separateAssetFetches = [
      // This is a big file, better fetch it alone.
      // Then browser cache also comes into play.
      fetchAssets([translationsPath]),
      // Not a config, and potentially a big file.
      // It can benefit of browser cache when being a separate fetch.
      fetchAssets([footerPath]),
      // App configs
      fetchAssets(configPaths),
    ];

    return Promise.all(separateAssetFetches)
      .then(([translationAsset, footerAsset, configAssets]) => {
        const getVersionHash = (response: any) => response?.data?.meta?.version;
        const versionInTranslationsCall = getVersionHash(translationAsset);
        const versionInFooterCall = getVersionHash(footerAsset);
        const versionInConfigsCall = getVersionHash(configAssets);
        const hasSameVersions =
          versionInTranslationsCall === versionInFooterCall &&
          versionInFooterCall === versionInConfigsCall;

        // NOTE: making separate calls means that there might be version mismatch
        // when using 'latest' alias.
        // Since we only fetch translations and footer as a separate calls from configs,
        // there should not be major problems with this approach.
        // TODO: potentially show an error page or reload if version mismatch is detected.
        if (!version && !hasSameVersions) {
          console.warn("Asset versions between calls don't match.");
        }

        const googleAnalyticsId = getGoogleAnalyticsId(
          configAssets,
          assets.analytics,
        );

        // Returned value looks like this for a single asset with name: "translations":
        // {
        //    translations: {
        //      path: 'content/translations.json', // an example path in Asset Delivery API
        //      data, // translation key & value pairs
        //    },
        // }
        const collectedAssets = assetEntries.reduce(
          (collectedAssets, assetEntry) => {
            const [name, path] = assetEntry;

            if (nonConfigAssets.includes(name)) {
              // There are distinct calls for these assets
              const assetResponse =
                name === 'translations' ? translationAsset : footerAsset;
              return {
                ...collectedAssets,
                [name]: { path, data: getFirstAssetData(assetResponse) },
              };
            }

            // Other asset path are assumed to be config assets
            const fetchedConfigAssets = getMultiAssetData(configAssets);
            const jsonAsset = findJSONAsset(
              fetchedConfigAssets,
              getAbsolutePath(path),
            );

            // branding.json config asset can contain image references,
            // which should be denormalized from "included" section of the response
            const data = denormalizeAssetData({
              data: jsonAsset?.attributes?.data,
              included: getMultiAssetIncluded(configAssets) || [],
            });
            return { ...collectedAssets, [name]: { path, data } };
          },
          {},
        );

        return {
          assets: collectedAssets as AssetsThunkResponse['assets'],
          version: versionInTranslationsCall as string | null,
          googleAnalyticsId,
        };
      })
      .catch(e => {
        log.error(e, 'app-asset-fetch-failed', { assets, version });
        return rejectWithValue(storableError(e));
      });
  },
);

const hostedAssetsSlice = createSlice({
  name: 'hostedAssets',
  initialState,
  reducers: {
    setTranslations: (state, action: PayloadAction<Record<string, any>>) => {
      state.translations = action.payload;
    },
    // setPageAssets: (state, action: PayloadAction<Record<string, any>>) => {
    //   state.pageAssetsData = action.payload;
    // },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppAssets.pending, state => {
        state.inProgress = true;
        state.error = null;
      })
      .addCase(fetchAppAssets.fulfilled, (state, action) => {
        const { assets, version, googleAnalyticsId } = action.payload;
        const { translations: translationsRaw, ...rest } = assets;
        state.hostedConfig = rest;
        state.hostedTranslations = translationsRaw?.data;

        mergeConfig(state.hostedConfig, defaultConfig);

        state.version = version;
        state.googleAnalyticsId = googleAnalyticsId;
        state.inProgress = false;
      })
      .addCase(fetchAppAssets.rejected, (state, action) => {
        state.inProgress = false;
        state.error = action.payload as StorableError;
      });
  },
});

const assetsState = (state: RootState) => state.hostedAssets;

// export const pageAssetsSelector = createSelector(
//   [assetsState],
//   state => state.pageAssetsData,
// );

export const hostedConfigSelector = createSelector(
  [assetsState],
  state => state.hostedConfig,
);

export const hostedTranslationsSelector = createSelector(
  [assetsState],
  state => state.hostedTranslations,
);

export const versionSelector = createSelector(
  [assetsState],
  state => state.version,
);

export const googleAnalyticsIdSelector = createSelector(
  [assetsState],
  state => state.googleAnalyticsId,
);

export const { setTranslations } = hostedAssetsSlice.actions;

export default hostedAssetsSlice.reducer;
