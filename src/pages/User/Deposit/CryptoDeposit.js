import React, { Component } from "react";
import { connect } from "react-redux";
import MetaTags from "react-meta-tags";
import {
	Row,
	Col,
	Card,
	CardBody,
	Input,
	Label,
	CardHeader,
	CardTitle,
} from "reactstrap";
import { withRouter, Link } from "react-router-dom";
import moment from "moment";
import HasAnyPermission from "../../../common/Permission";
import hasPermission from "../../../common/HasPermission";
import ReactDataTable from "../../../common/ReactDataTable";
import { apiUrl } from "../../../config";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
// import { updateFiatDeposit } from "../../store/deposit/actions";
import { toast } from "react-toastify";
import isEmpty from "../../../validation/isEmpty";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { accountList, TransactionStatus } from "../../../common/marketList";
import { basicInfo } from "../../../store/user/actions";
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
const txBlockApi = "https://live.blockcypher.com/btc/tx";
const txXrpApi = "https://xrpscan.com/tx";
const txEthApi = "https://etherscan.io/tx";

class CryptoDeposit extends Component {
	state = {
		ajaxProcess: false,
	};

	componentDidMount = () => {
		this.props.basicInfo(this.props.match.params.id);
	};

	componentDidUpdate = (prevProps, prevState) => {
		if (prevProps.userId !== this.props.userId) {
			this.props.basicInfo(this.props.userId);
			this.refreshCryptoTransactionTableData();
		}
	};
	userCryptoTranscationColunms = () => [
		{
			label: "Date",
			name: "date",
			options: {
				filterType: "custom",
				customFilterListOptions: {
					render: (v) => {
						if (v?.[0])
							return `From Date : ${moment(v[0]).format(
								"MM/DD/YYYY"
							)} - To Date : ${moment(v[1]).format(
								"MM/DD/YYYY"
							)}`;
						return [];
					},
					update: (filterList, filterPos, index) => {
						filterList[index] = [];
						return filterList;
					},
				},
				filterOptions: {
					display: (filterList, onChange, index, column) => {
						return (
							<Flatpickr
								className="form-control d-block"
								placeholder="Date Range"
								options={{
									mode: "range",
									dateFormat: "m/d/Y",
								}}
								value={
									filterList[index] || [
										new Date(),
										new Date(),
									]
								}
								onChange={(date) => {
									filterList[index] = date;
									onChange(filterList[index], index, column);
								}}
							/>
						);
					},
				},
				sort: true,
			},
		},

		{
			name: "type",
			label: "Type",
			options: {
				// customFilterListOptions: {
				//     render: v => v.map(l => this.getCountryName(l)),
				// },
				filterType: "custom",
				filterOptions: {
					names: [],
					display: (filterList, onChange, index, column) => {
						const optionValues = ["Deposit", "Withdrawal"];
						return (
							<div className="mb-3">
								<label
									htmlFor="choices-single-no-sorting"
									className="form-label font-size-13 text-muted"
								></label>
								<select
									value={filterList[index][0] || ""}
									onChange={(event) => {
										filterList[index][0] =
											event.target.value;
										onChange(
											filterList[index],
											index,
											column
										);
									}}
									className="form-control"
									name="choices-single-no-sorting"
								>
									<option disabled value="">
										Type
									</option>
									{optionValues.map((item) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>
						);
					},
				},
				sort: false,
			},
		},
		{
			name: "coin",
			label: "Account",
			options: {
				// customFilterListOptions: {
				//     render: v => v.map(l => this.getCountryName(l)),
				// },
				filterType: "custom",
				filterOptions: {
					names: [],
					display: (filterList, onChange, index, column) => {
						const optionValues = accountList;
						return (
							<div className="mb-3">
								<label
									htmlFor="order-market"
									className="form-label font-size-13 text-muted"
								></label>
								<select
									value={filterList[index][0] || ""}
									onChange={(event) => {
										filterList[index][0] =
											event.target.value;
										onChange(
											filterList[index],
											index,
											column
										);
									}}
									className="form-control"
									name="order-market"
								>
									<option disabled value="">
										Account
									</option>
									{optionValues.map((item) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>
						);
					},
				},
				sort: false,
			},
		},
		{
			name: "value",
			label: "Value",
			options: {
				filter: false,
				sort: false,
			},
		},
		{
			name: "fees",
			label: "Fees",
			options: {
				filter: false,
				sort: false,
			},
		},
		{
			name: "txid_short",
			label: "Short Transcation ID",
			options: {
				filter: false,
				sort: false,
				download: false,
			},
		},
		// {
		//     name: 'txid',
		//     label: 'Transcation ID',
		//     options: {
		//         filter: false,
		//         sort: false,
		//     }
		// },
		// {
		//     name: 'sender',
		//     label: 'Sender ID',
		//     options: {
		//         filter: false,
		//         sort: false,
		//     }
		// },
		// {
		//     name: 'receiver',
		//     label: 'receiver ID',
		//     options: {
		//         filter: false,
		//         sort: false,
		//     }
		// },

		{
			name: "state",
			label: "Status",
			options: {
				// customFilterListOptions: {
				//     render: v => v.map(l => this.getCountryName(l)),
				// },
				filterType: "custom",
				filterOptions: {
					names: [],
					display: (filterList, onChange, index, column) => {
						const optionValues = TransactionStatus;
						return (
							<div className="mb-3">
								<label
									htmlFor="choices-single-no-sorting"
									className="form-label font-size-13 text-muted"
								></label>
								<select
									value={filterList[index][0] || ""}
									onChange={(event) => {
										filterList[index][0] =
											event.target.value;
										onChange(
											filterList[index],
											index,
											column
										);
									}}
									className="form-control"
									name="choices-single-no-sorting"
								>
									<option disabled value="">
										Status
									</option>
									{optionValues.map((item) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</select>
							</div>
						);
					},
				},
				sort: false,
			},
		},
		{
			name: "action",
			label: "action",
			options: {
				filter: false,
				display: "excluded",
				viewColumns: false,
				download: false,
			},
		},
	];

	cryptoTranscationResultFormatter = (result) => {
		return result.data.docs.map((item) => {
			return {
				state: item.state,
				value: item.value,
				// senderAddress: item.senderAddress,
				// receiverAddress: item.receiverAddress,
				// txid: item.txid,
				fees: item.fees,
				type: item.type,
				rate: this.formatPrice(item.rate),
				coin: item.coin,
				txid_short: item.txid.substr(1, 8),
				date: moment(item.date).format("L LTS"),
				action: item,
			};
		});
	};

	expandableComponentCryptoTranscation = (rowData, rowMeta) => {
		const data = rowData[rowData.length - 1];
		return (
			<>
				<tr>
					<td colSpan="1"> </td>
					<td colSpan="2">Transcation ID</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{" "}
						{isEmpty(data.txid) ? (
							"-"
						) : (
							<a
								href={`${this.getTxApi(data.coin)}/${
									data.txid
								}/`}
								rel="noopener noreferrer"
								target="_blank"
							>
								{data.txid}
							</a>
						)}{" "}
					</td>
				</tr>

				<tr>
					<td colSpan="1"> </td>
					<td colSpan="2">Sender Address</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{" "}
						{isEmpty(data.senderAddress)
							? "-"
							: data.senderAddress}{" "}
					</td>
				</tr>

				<tr>
					<td colSpan="1"> </td>
					<td colSpan="2">Receiver Address</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{isEmpty(data.receiverAddress) ? (
							"-"
						) : (
							<CopyToClipboard
								text={data.receiverAddress}
								style={{ cursor: "pointer" }}
								onCopy={() => this.handleTooltipOpen()}
							>
								<span style={{ cursor: "pointer" }}>
									{data.receiverAddress}
								</span>
							</CopyToClipboard>
						)}
					</td>
				</tr>
				<tr>
					<td colSpan="1"> </td>
					<td colSpan="2">Destination Tag</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{isEmpty(data.destinationTag) ? (
							"-"
						) : (
							<CopyToClipboard
								text={data.destinationTag}
								style={{ cursor: "pointer" }}
								onCopy={() => this.handleTooltipOpen()}
							>
								<span style={{ cursor: "pointer" }}>
									{data.destinationTag}
								</span>
							</CopyToClipboard>
						)}
					</td>
				</tr>
			</>
		);
	};

	handleTooltipOpen = () => {
		toast.success("Copied to clipboard.");
	};

	getTxApi = (type) => {
		let txApi = txBlockApi;
		if (type === "XRP") {
			txApi = txXrpApi;
		}
		if (type === "ETH") {
			txApi = txEthApi;
		}
		return txApi;
	};

	expandableComponentCryptoTranscation = (rowData, rowMeta) => {
		const data = rowData[rowData.length - 1];
		return (
			<>
				<tr className="MuiTableRow-root">
					<td colSpan="1"> </td>
					<td colSpan="2">Transcation ID</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{" "}
						{isEmpty(data.txid) ? (
							"-"
						) : (
							<a
								href={`${this.getTxApi(data.coin)}/${
									data.txid
								}/`}
								rel="noopener noreferrer"
								target="_blank"
							>
								{data.txid}
							</a>
						)}{" "}
					</td>
				</tr>

				<tr className="MuiTableRow-root">
					<td colSpan="1"> </td>
					<td colSpan="2">Sender Address</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{" "}
						{isEmpty(data.senderAddress)
							? "-"
							: data.senderAddress}{" "}
					</td>
				</tr>

				<tr className="MuiTableRow-root">
					<td colSpan="1"> </td>
					<td colSpan="2">Receiver Address</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{isEmpty(data.receiverAddress) ? (
							"-"
						) : (
							<CopyToClipboard
								text={data.receiverAddress}
								style={{ cursor: "pointer" }}
								onCopy={() => this.handleTooltipOpen()}
							>
								<span style={{ cursor: "pointer" }}>
									{data.receiverAddress}
								</span>
							</CopyToClipboard>
						)}
					</td>
				</tr>
				<tr className="MuiTableRow-root">
					<td colSpan="1"> </td>
					<td colSpan="2">Destination Tag</td>
					<td colSpan="6" style={{ wordBreak: "break-all" }}>
						{isEmpty(data.destinationTag) ? (
							"-"
						) : (
							<CopyToClipboard
								text={data.destinationTag}
								style={{ cursor: "pointer" }}
								onCopy={() => this.handleTooltipOpen()}
							>
								<span style={{ cursor: "pointer" }}>
									{data.destinationTag}
								</span>
							</CopyToClipboard>
						)}
					</td>
				</tr>
			</>
		);
	};

	formatPrice(value) {
		var value_split = (value + "").split(".");
		var fraction = value_split[1];
		if (fraction === undefined) {
			fraction = "00";
		}
		value = value_split[0].replace(/[^0-9]/g, "");
		let val = (value / 1).toFixed(0).replace(".", ".");
		return (
			val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
			"." +
			fraction
		);
	}

	cryptoTranscationDefaultFilterApplyHasPermission = () => {
		const couldShowDeposite =
			this.props.auth.currentUserRolePermissions.some((item) =>
				["user crypto deposit list"].includes(item)
			);
		const couldShowWithdrawal =
			this.props.auth.currentUserRolePermissions.some((item) =>
				["user crypto withdrawal list"].includes(item)
			);
		if (couldShowDeposite && couldShowWithdrawal) return [];
		else if (couldShowWithdrawal)
			return [{ name: "type", value: ["Withdrawal"] }];
		else if (couldShowDeposite)
			return [{ name: "type", value: ["Deposit"] }];
		return [];
	};

	render() {
		return (
			<React.Fragment>
				<Row>
					<Col>
						<Card>
							{/* <CardHeader>
								<CardTitle className="mb-0">
									Crypto Transaction
								</CardTitle>
							</CardHeader> */}
							<CardBody>
								<div className="table-rep-plugin">
									<div
										className="table-responsive mb-0"
										data-pattern="priority-columns"
									>
										<HasAnyPermission
											permission={[
												"user crypto deposit list",
												"user crypto withdrawal list",
											]}
										>
											<div className="table-responsive">
												<ReactDataTable
													url={`${apiUrl}/api/admin/users/get-crypto-transactions/${this.props.userId}`}
													columns={this.userCryptoTranscationColunms()}
													resultFormatter={
														this
															.cryptoTranscationResultFormatter
													}
													renderExpandableRow={
														this
															.expandableComponentCryptoTranscation
													}
													setRefresh={(refresh) =>
														(this.refreshCryptoTransactionTableData =
															refresh)
													}
													downloadOptions={{
														filename: `crypto trans-${
															this.props
																.userDetails
																.basicInfo
																?.email
																? this.props
																		.userDetails
																		.basicInfo
																		.email +
																  ".csv"
																: "tableDownload.csv"
														}`,
													}}
													expandableRows={true}
													filters={this.cryptoTranscationDefaultFilterApplyHasPermission()}
													origin={
														"Crypto Transaction List"
													}
													rowsPerPage={10}
												/>
											</div>
										</HasAnyPermission>
									</div>
								</div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}

CryptoDeposit.propTypes = {
	auth: PropTypes.object.isRequired,
};

const mapStateToProp = (state) => ({
	auth: state.auth,
	deposit: state.deposit,
	userDetails: state.user.userDetails,
});

export default connect(mapStateToProp, {
	// updateFiatDeposit,
	basicInfo,
})(withRouter(CryptoDeposit));
