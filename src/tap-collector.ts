import {
  SignerAuthorized,
  SignerRevoked,
  SignerThawCanceled,
  SignerThawing,
  PaymentCollected
} from "../generated/TapCollector/TapCollector"
/* eslint-disable prefer-const */
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  Transaction,
  Payer,
  Receiver,
  EscrowAccount,
  Signer,
  Collector
} from '../generated/schema'
import { createOrLoadEscrowAccount, createOrLoadPayer, createOrLoadReceiver, createOrLoadSigner } from "./tap-utils"
let ZERO_BI = BigInt.fromI32(0)
let ZERO_AD = Bytes.fromHexString('0x0000000000000000000000000000000000000000')

export function handleSignerAuthorized(event: SignerAuthorized): void {
  let signer = createOrLoadSigner(event.params.authorizedSigner)
  signer.isAuthorized = true
  signer.payer = event.params.payer
  signer.thawEndTimestamp = ZERO_BI
  signer.save()
}

export function handleSignerRevoked(event: SignerRevoked): void {
  let signer = createOrLoadSigner(event.params.authorizedSigner)
  signer.isAuthorized = false
  signer.payer = event.params.payer
  signer.thawEndTimestamp = ZERO_BI
  signer.save()
}

export function handleSignerThawing(event: SignerThawCanceled): void {
  let signer = createOrLoadSigner(event.params.authorizedSigner)
  signer.payer = event.params.payer
  signer.isAuthorized = true
  signer.thawEndTimestamp = event.params.thawEndTimestamp
  signer.save()
}

export function handleSignerThawCanceled(event: SignerThawing): void {
  let signer = createOrLoadSigner(event.params.authorizedSigner)
  signer.payer = event.params.payer
  signer.isAuthorized = true
  signer.thawEndTimestamp = ZERO_BI
  signer.save()
}

export function handlePaymentCollected(event: PaymentCollected): void {
  let index = event.logIndex.toI32()
  let transactionId = event.transaction.hash.concatI32(index)
  let transaction = new Transaction(transactionId)
  let payer = createOrLoadPayer(event.params.payer)
  let receiver = createOrLoadReceiver(event.params.receiver)
  let escrow = createOrLoadEscrowAccount(event.params.payer, event.params.dataService, event.params.receiver)
  let total_tokens_collected = escrow.balance.minus(event.params.tokensDataService).minus(event.params.tokensReceiver)
  escrow.balance = total_tokens_collected
  transaction.type = "redeem"
  transaction.payer = payer.id
  transaction.receiver = receiver.id

  transaction.tokens = total_tokens_collected
  transaction.paymentType = event.params.paymentType
  transaction.escrowAccount = escrow.id
  transaction.transactionGroupID = event.transaction.hash
  transaction.timestamp = event.block.timestamp

  transaction.save()
  escrow.save()
}
