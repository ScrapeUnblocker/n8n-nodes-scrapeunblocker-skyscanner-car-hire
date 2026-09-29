import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField } from './GenericFunctions';
import { applyOptions, requireString, runActorAndGetItems } from './GenericFunctions';

// ScrapeUnblocker's public "Skyscanner Car Hire Scraper" Actor: https://apify.com/scrapeunblocker/skyscanner-car-hire-scraper
const ACTOR_ID = 'MXQo3gvaeyiZ47p2h';
const INTEGRATION_APP_ID = 'scrapeunblocker-skyscanner-car-hire-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	pickupDate: {
		key: 'pickupDate',
	},
	pickupTime: {
		key: 'pickupTime',
	},
	dropoffDate: {
		key: 'dropoffDate',
	},
	dropoffTime: {
		key: 'dropoffTime',
	},
	dropoff: {
		key: 'dropoff',
	},
	dropoffId: {
		key: 'dropoffId',
	},
	driverAge: {
		key: 'driverAge',
	},
	currency: {
		key: 'currency',
		kind: 'upper',
	},
	market: {
		key: 'market',
		kind: 'upper',
	},
	locale: {
		key: 'locale',
	},
};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'offer:search': {
			input.pickup = requireString.call(this, 'pickup', 'Pickup Location', itemIndex);
			input.maxResults = this.getNodeParameter('maxResults', itemIndex);
			break;
		}
		case 'offer:searchByLocationId': {
			input.pickupId = requireString.call(this, 'pickupId', 'Pickup Location ID', itemIndex);
			input.maxResults = this.getNodeParameter('maxResults', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for resource "${resource}"`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class SkyscannerCarHireScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Skyscanner Car Hire Scraper',
		name: 'skyscannerCarHireScraper',
		icon: {
			light: 'file:skyscannerCarHireScraper.png',
			dark: 'file:skyscannerCarHireScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search live car hire offers and prices on Skyscanner with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'Skyscanner Car Hire Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Offer',
						value: 'offer',
					},
				],
				default: 'offer',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['offer'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search car hire offers at a pickup place given by name',
						action: 'Search offers',
					},
					{
						name: 'Search by Location ID',
						value: 'searchByLocationId',
						description: 'Search car hire offers at an exact Skyscanner location ID',
						action: 'Search offers by location ID',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Pickup Location',
				name: 'pickup',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Madrid',
				description:
					"City, airport or station to pick up the car, e.g. 'Madrid' or 'Malaga airport'. The name is resolved automatically.",
				displayOptions: {
					show: {
						resource: ['offer'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 50,
				description:
					'Maximum number of offers to return, cheapest first. 0 returns every offer found.',
				displayOptions: {
					show: {
						resource: ['offer'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Pickup Location ID',
				name: 'pickupId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '95673800',
				description:
					"Skyscanner's own location ID of the pickup place, e.g. '95673800'. Use it for places the name search cannot reach or when a name is ambiguous.",
				displayOptions: {
					show: {
						resource: ['offer'],
						operation: ['searchByLocationId'],
					},
				},
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 50,
				description:
					'Maximum number of offers to return, cheapest first. 0 returns every offer found.',
				displayOptions: {
					show: {
						resource: ['offer'],
						operation: ['searchByLocationId'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Currency',
						name: 'currency',
						type: 'string',
						default: 'EUR',
						placeholder: 'EUR',
						description:
							'Currency of the prices (ISO code, e.g. EUR, USD or GBP). Defaults to EUR.',
					},
					{
						displayName: 'Driver Age',
						name: 'driverAge',
						type: 'number',
						typeOptions: {
							minValue: 18,
							maxValue: 99,
						},
						default: 30,
						description: 'Age of the main driver. It affects availability and price.',
					},
					{
						displayName: 'Dropoff Date',
						name: 'dropoffDate',
						type: 'string',
						default: '',
						placeholder: '2026-11-15',
						description: 'Dropoff date as YYYY-MM-DD. Leave blank for 2 days after pickup.',
					},
					{
						displayName: 'Dropoff Location',
						name: 'dropoff',
						type: 'string',
						default: '',
						placeholder: 'Barcelona',
						description:
							'Where to return the car, by name. Leave blank to return it to the pickup place.',
					},
					{
						displayName: 'Dropoff Location ID',
						name: 'dropoffId',
						type: 'string',
						default: '',
						description:
							"Skyscanner's own location ID of the dropoff place. Overrides Dropoff Location.",
					},
					{
						displayName: 'Dropoff Time',
						name: 'dropoffTime',
						type: 'string',
						default: '10:00',
						placeholder: '10:00',
						description: 'Dropoff time as HH:MM (24-hour clock)',
					},
					{
						displayName: 'Locale',
						name: 'locale',
						type: 'string',
						default: 'en-GB',
						placeholder: 'en-GB',
						description: 'Language of the results (e.g. en-GB or es-ES). Defaults to en-GB.',
					},
					{
						displayName: 'Market',
						name: 'market',
						type: 'string',
						default: 'UK',
						placeholder: 'UK',
						description:
							'Country you are booking from (e.g. UK, US or ES). It affects prices and providers. Defaults to UK.',
					},
					{
						displayName: 'Pickup Date',
						name: 'pickupDate',
						type: 'string',
						default: '',
						placeholder: '2026-11-12',
						description: 'Pickup date as YYYY-MM-DD. Leave blank for about 60 days from today.',
					},
					{
						displayName: 'Pickup Time',
						name: 'pickupTime',
						type: 'string',
						default: '10:00',
						placeholder: '10:00',
						description: 'Pickup time as HH:MM (24-hour clock)',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Maximum run time of the Apify Actor run. 0 keeps the Actor default. A run that times out fails the node.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});

				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
