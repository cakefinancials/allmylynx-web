import React, { Component, Fragment } from 'react';
import { Alert } from 'react-bootstrap';
import * as R from 'ramda';

import { EstimatedCakeEarnings, EstimatedCakeEarningsDefault } from './EstimatedCakeEarnings';
import LoadingSpinner from '../LoadingSpinner';
import TickerChart from './TickerChart';
import { ESPPDetails, ESPPDetailsDefault } from './ESPPDetails';

import './Main.css';
import cakeImageSrc from '../../public/app/cake.png';
import cakeSliceImageSrc from '../../public/app/cake-slice.png';
import donutImageSrc from '../../public/app/donut.png';

import { subscribeUserDashboardDataChange } from '../../libs/userState';

const SIDEBAR_TABS_NAMES = {
    DASHBOARD: 'DASHBOARD',
    ESTIMATED_EARNINGS: 'ESTIMATED_EARNINGS',
    LEARNING_CENTER: 'LEARNING_CENTER',
};

const SIDEBAR_TABS = [
    {
        name: SIDEBAR_TABS_NAMES.DASHBOARD,
        imgSrc: cakeImageSrc,
        mainText: 'Dashboard'
    },
    {
        name: SIDEBAR_TABS_NAMES.ESTIMATED_EARNINGS,
        imgSrc: donutImageSrc,
        mainText: 'Estimated Earnings',
        smallText: 'Coming Soon!'
    },
    {
        name: SIDEBAR_TABS_NAMES.LEARNING_CENTER,
        imgSrc: cakeSliceImageSrc,
        mainText: 'Learning Center',
        smallText: 'Coming Soon!'
    },
];

export default class Main extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoadingUserDashboardData: true,
            userDashboardData: null,
            errorLoadingDashboardData: false,
            selectedSidebarTab: SIDEBAR_TABS_NAMES.DASHBOARD
        };
    }

    async componentDidMount() {
        this.unsubscribeUserDashboardData = subscribeUserDashboardDataChange(({ userDashboardData, loading, error }) => {
            this.setState({ userDashboardData, isLoadingUserDashboardData: loading, errorLoadingDashboardData: error });
        });

        document.body.classList.add('main-dashboard');
    }

    componentWillUnmount() {
        document.body.classList.remove('main-dashboard');
        if (this.unsubscribeUserDashboardData) {
            this.unsubscribeUserDashboardData();
        }
    }

    renderInitialLoading = () => {
        return (
            <LoadingSpinner bsSize='large' text='Loading your dashboard...' />
        );
    }

    renderDataMissingDashboard() {
        return (
            <Fragment>
                <div className='center-text'>
                    <div className='purple-cake-text'>
                        <big>Welcome to your Cake dashboard! All of your data will populate after your analyst has reviewed your account details.</big>
                    </div>
                    <EstimatedCakeEarningsDefault />
                </div>
                <div className='dashboard-spacing' />
                <TickerChart stockTicker={null} />
                <div className='dashboard-spacing' />
                <ESPPDetailsDefault />
            </Fragment>
        );
    }

    renderSelectedTab() {
        const renderers = {
            [SIDEBAR_TABS_NAMES.DASHBOARD]: () => {
                const { userDashboardData } = this.state;

                if (userDashboardData === null || userDashboardData.company === '') {
                    return this.renderDataMissingDashboard();
                }

                return (
                    <Fragment>
                        <EstimatedCakeEarnings
                            estimated2017Earnings={userDashboardData['ESTIMATED 2017 EARNINGS']}
                            purchasePeriod={userDashboardData['PURCHASE PERIOD']}
                        />
                        <div className='dashboard-spacing' />
                        <TickerChart stockTicker={userDashboardData['STOCK TICKER']} />
                        <div className='dashboard-spacing' />
                        <ESPPDetails
                            salary={userDashboardData['SALARY']}
                            currentPaycheckAmount={userDashboardData['CURRENT PAYCHECK AMOUNT']}
                            payPeriod={userDashboardData['PAY PERIOD']}
                            lastPaycheck={userDashboardData['LAST PAYCHECK']}
                            company={userDashboardData['COMPANY']}
                            companyDiscount={userDashboardData['COMPANY DISCOUNT']}
                            lookback={userDashboardData['LOOKBACK']}
                            purchasePeriod={userDashboardData['PURCHASE PERIOD']}
                            maxAllowableContribution={userDashboardData['MAX ALLOWABLE CONTRIBUTION']}
                            eSPPNotes={userDashboardData['ESPP NOTES']}
                            policyLink={userDashboardData['POLICY LINK']}
                        />
                    </Fragment>
                );
            },
            [SIDEBAR_TABS_NAMES.ESTIMATED_EARNINGS]: () => <h3>COMING SOON...</h3>,
            [SIDEBAR_TABS_NAMES.LEARNING_CENTER]: () => <h3>COMING SOON...</h3>,
        };

        return renderers[this.state.selectedSidebarTab]();
    }

    renderMainDashboard() {
        if (this.state.errorLoadingDashboardData) {
            return (
                <Alert bsStyle='danger' className='center-text'>
                    <strong>There was an issue loading the page! Please try again in a bit, or contact us for support</strong>
                </Alert>
            );
        }

        return (
            <Fragment>
                <div className='sidenav'>
                    <p className='dashboard-header'>Your Dashboard</p>
                    {
                        R.map(
                            ({ name, imgSrc, mainText, smallText }) => {
                                const selected = name === this.state.selectedSidebarTab;
                                return (
                                    <div
                                        className={
                                            'sidenav-option' +
                                            (selected ? ' selected' : '') +
                                            (smallText ? ' small-text' : '')
                                        }
                                        key={name}
                                        onClick={() => {
                                            this.setState({ selectedSidebarTab: name });
                                        }}
                                    >
                                        <img alt='' src={imgSrc} />
                                        <span>{mainText}</span>
                                        {
                                            smallText ?
                                                <Fragment>
                                                    <br />
                                                    <span className='small-text'>{smallText}</span>
                                                </Fragment>
                                                : null
                                        }
                                    </div>
                                );
                            },
                            SIDEBAR_TABS
                        )
                    }
                </div>
                <div className='main'>
                    { this.renderSelectedTab() }
                </div>
            </Fragment>
        );
    }

    getRenderBody() {
        if (this.state.isLoadingUserDashboardData) {
            return this.renderInitialLoading();
        } else {
            return this.renderMainDashboard();
        }
    }

    render() {
        return (
            <div className='cake-dashboard-main'>
                { this.getRenderBody() }
            </div>
        );
    }
}