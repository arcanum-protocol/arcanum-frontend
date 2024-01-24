import * as React from 'react';
import { useEffect, useRef, memo } from 'react';
import {
    widget,
    ChartingLibraryWidgetOptions,
    type ResolutionString,
    type ChartingLibraryFeatureset
} from '../lib/charting_library';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';

export const SUPPORTED_RESOLUTIONS = { 1: "1m", 3: "3m", 5: "5m", 15: "15m", 30: "30m", 60: "1h", 720: "12h", "1D": "1d" };

const GREEN = "#4ADE80";
const RED = "#F87171";

export const DEFAULT_PERIOD = "12h";

const chartStyleOverrides = ["candleStyle", "hollowCandleStyle", "haStyle"].reduce((acc, cv) => {
    acc[`mainSeriesProperties.${cv}.drawWick`] = true;
    acc[`mainSeriesProperties.${cv}.drawBorder`] = false;
    acc[`mainSeriesProperties.${cv}.upColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.downColor`] = RED;
    acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED;
    acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED;
    return acc;
}, {});

const chartOverrides = {
    "paneProperties.background": "rgba(12, 10, 9, 1)",
    //"paneProperties.backgroundGradientStartColor": "#4D4D4D",
    //"paneProperties.backgroundGradientEndColor": "#4D4D4D",
    "paneProperties.backgroundType": "solid",
    "paneProperties.vertGridProperties.color": "#292524",
    "paneProperties.vertGridProperties.style": 2,
    "paneProperties.horzGridProperties.color": "#292524",
    "paneProperties.horzGridProperties.style": 2,
    "mainSeriesProperties.priceLineColor": "#292524",
    "scalesProperties.textColor": "#fff",
    "scalesProperties.lineColor": "#292524",
    "lineStyle.color": "#8AA9FF",
    ...chartStyleOverrides,
};

export const disabledFeaturesOnMobile = ["header_saveload", "header_fullscreen_button"];

export const defaultChartProps = {
    theme: "Dark",
    locale: "en",
    library_path: "/charting_library/",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    header_widget_dom_node: false,
    overrides: chartOverrides,
    custom_css_url: "/tradingview-chart.css",
    loading_screen: { backgroundColor: "rgba(12, 10, 9, 0.8)", foregroundColor: "rgba(12, 10, 9, 0.8)" },
    favorites: { 3: "3m", },
};

export interface ChartContainerProps {
    symbol: ChartingLibraryWidgetOptions['symbol'];
    interval: ChartingLibraryWidgetOptions['interval'];

    // BEWARE: no trailing slash is expected in feed URL
    datafeedUrl: string;
    libraryPath: ChartingLibraryWidgetOptions['library_path'];
    chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
    chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
    clientId: ChartingLibraryWidgetOptions['client_id'];
    userId: ChartingLibraryWidgetOptions['user_id'];
    fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
    autosize: ChartingLibraryWidgetOptions['autosize'];
    studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
    container: ChartingLibraryWidgetOptions['container'];
}

const TVChartContainer = observer(() => {
    const { multipoolId, datafeedUrl } = useStore();
    const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        const widgetOptions: ChartingLibraryWidgetOptions = {
            theme: "dark",
            symbol: multipoolId as string,
            datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(datafeedUrl),
            interval: '15' as ResolutionString,
            container: chartContainerRef.current,
            library_path: defaultChartProps.library_path as string,
            loading_screen: { backgroundColor: "rgba(12, 10, 9, 1)", foregroundColor: "rgba(12, 10, 9, 1)" },

            locale: 'en',
            enabled_features: [
                "side_toolbar_in_fullscreen_mode",
                "header_in_fullscreen_mode",
                "hide_resolution_in_legend",
                "items_favoriting",
                "hide_left_toolbar_by_default",
            ],
            client_id: defaultChartProps.clientId,
            disabled_features: [
                "volume_force_overlay",
                "show_logo_on_all_charts",
                "caption_buttons_text_if_possible",
                "create_volume_indicator_by_default",
                "header_compare",
                "compare_symbol",
                "display_market_status",
                "header_interval_dialog_button",
                "show_interval_dialog_on_key_press",
                "header_symbol_search",
                "popup_hints",
                "header_in_fullscreen_mode",
                "use_localstorage_for_settings",
                "right_bar_stays_on_scroll",
                "symbol_info",
            ].concat(disabledFeaturesOnMobile) as ChartingLibraryFeatureset[],
            user_id: defaultChartProps.userId,
            custom_css_url: '/tradingview-chart.css',
            fullscreen: false,
            autosize: true,
            //overrides: defaultChartProps.overrides,
            overrides: {
                "mainSeriesProperties.style": 2,
                ...defaultChartProps.overrides,
                
            },
            favorites: {
                ...defaultChartProps.favorites, intervals: ["15", "720", "1D"] as ResolutionString[],
            },
        };

        const tvWidget = new widget(widgetOptions);

        tvWidget.onChartReady(() => {
            tvWidget.headerReady().then(() => {
                const button = tvWidget.createButton();
                button.setAttribute('title', 'Click to show a notification popup');
                button.classList.add('apply-common-tooltip');
                button.addEventListener('click', () => tvWidget.showNoticeDialog({
                    title: 'Notification',
                    body: 'TradingView Charting Library API works correctly',
                    callback: () => {
                        console.log('Noticed!');
                    },
                }));
                button.innerHTML = 'Check API';
            });
        });

        return () => {
            tvWidget.remove();
        };
    });

    return (
        <div
            ref={chartContainerRef}
            className={`TVChartContainer w-full h-[16rem] xl:h-[30rem] rounded-2xl`}
        />
    );
});

export default memo(TVChartContainer);
