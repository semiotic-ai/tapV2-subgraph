import {
  CancelThaw,
  Deposit,
  Initialized,
  Thaw,
  Withdraw,
} from "../generated/PaymentsEscrow/PaymentsEscrow"
/* eslint-disable prefer-const */
import { BigInt, Address } from '@graphprotocol/graph-ts';
import { createOrLoadCollector, createOrLoadEscrowAccount, createOrLoadPayer, createOrLoadReceiver, TAP_COLLECTOR } from "./tap-utils"

const ZERO_BI = BigInt.fromI32(0)
// Todo receive actual address
const COLLECTOR_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000001");

// This will run at the begining of the contract so TAP collector is created
// yes this is redundant but its a needed thing for indexer-rs to
// to be able to grab teh address from the subgraph from the start
export function handleInitialized(event: Initialized): void {
  createOrLoadCollector(TAP_COLLECTOR)
}

export function handleThaw(event: Thaw): void {
  let payer = createOrLoadPayer(event.params.payer)
  let receiver = createOrLoadReceiver(event.params.receiver)
  let collector = createOrLoadCollector(event.params.collector)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.collector, event.params.receiver)

  escrow.totalAmountThawing = event.params.tokens
  escrow.thawEndTimestamp = event.params.thawEndTimestamp
  escrow.payer = payer.id
  escrow.receiver = receiver.id
  escrow.collector = collector.id
  escrow.save()

}

export function handleCancelThaw(event: CancelThaw): void {
  // TODO: The contract/abi needs to be updated since here collector is not included and it should be
  // This is not our fault but rather a mistake from E&N so need to wait for the to fix it
  let escrow = createOrLoadEscrowAccount(event.params.payer, COLLECTOR_ADDRESS, event.params.receiver)
  escrow.totalAmountThawing = ZERO_BI
  escrow.thawEndTimestamp = ZERO_BI
  escrow.save()
}

export function handleDeposit(event: Deposit): void {
  createOrLoadPayer(event.params.payer)
  createOrLoadReceiver(event.params.receiver)
  createOrLoadCollector(event.params.collector)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.collector, event.params.receiver)

  escrow.balance = escrow.balance.plus(event.params.tokens)
  escrow.save()
}

export function handleWithdraw(event: Withdraw): void {
  let index = event.logIndex.toI32()
  event.transaction.hash.concatI32(index)
  createOrLoadPayer(event.params.payer)
  createOrLoadReceiver(event.params.receiver)
  createOrLoadCollector(event.params.collector)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.collector, event.params.receiver)

  escrow.balance = escrow.balance.minus(event.params.tokens)
  escrow.totalAmountThawing = ZERO_BI
  escrow.thawEndTimestamp = ZERO_BI
  escrow.save()
}
