import {
  CancelThaw,
  Deposit,
  Thaw,
  Withdraw,
} from "../generated/PaymentsEscrow/PaymentsEscrow"
/* eslint-disable prefer-const */
import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  Transaction,
} from '../generated/schema'
import { createOrLoadCollector, createOrLoadEscrowAccount, createOrLoadPayer, createOrLoadReceiver } from "./tap-utils"
import "dotenv/config";

const ZERO_BI = BigInt.fromI32(0)
// Todo receive actual address
const COLLECTOR_ADDRESS = Address.fromString(String(process.env.COLLECTOR_ADDRESS));

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
  let index = event.logIndex.toI32()
  let transactionId = event.transaction.hash.concatI32(index)
  let transaction = new Transaction(transactionId)
  let payer = createOrLoadPayer(event.params.payer)
  let receiver = createOrLoadReceiver(event.params.receiver)
  let collector = createOrLoadCollector(event.params.collector)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.collector, event.params.receiver)

  escrow.balance = escrow.balance.plus(event.params.tokens)

  transaction.type = "deposit"
  transaction.payer = payer.id
  transaction.receiver = receiver.id
  transaction.collector = collector.id
  transaction.tokens = event.params.tokens
  transaction.escrowAccount = escrow.id
  transaction.transactionGroupID = event.transaction.hash
  transaction.timestamp = event.block.timestamp

  transaction.save()
  escrow.save()
}

export function handleWithdraw(event: Withdraw): void {
  let index = event.logIndex.toI32()
  let transactionId = event.transaction.hash.concatI32(index)
  let transaction = new Transaction(transactionId)
  let payer = createOrLoadPayer(event.params.payer)
  let receiver = createOrLoadReceiver(event.params.receiver)
  let collector = createOrLoadCollector(event.params.collector)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.collector, event.params.receiver)

  escrow.balance = escrow.balance.minus(event.params.tokens)
  escrow.totalAmountThawing = ZERO_BI
  escrow.thawEndTimestamp = ZERO_BI

  transaction.type = "withdraw"
  transaction.payer = payer.id
  transaction.receiver = receiver.id
  transaction.collector = collector.id
  transaction.tokens = event.params.tokens
  transaction.escrowAccount = escrow.id
  transaction.transactionGroupID = event.transaction.hash
  transaction.timestamp = event.block.timestamp

  transaction.save()
  escrow.save()

}
