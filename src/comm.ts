// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.


import utils = require('./utils');
import kernel = require('./kernel');

import Kernel = kernel.Kernel;
import IKernelMsg = kernel.IKernelMsg;
import IKernelFuture = kernel.IKernelFuture;


/**
 * CommManager class.
 */
export 
class CommManager {

  /**
   * Create a CommManager instance.
   */
  constructor(sendFunc : any) {
    this._sendFunc = sendFunc;
    this._comms = new Map<string, Promise<Comm>>();
    this._targets= new Map<string, () => void>();
  }

  /**
   * Create a new Comm, register it, and open its Kernel-side counterpart
   * Mimics the auto-registration in `Comm.__init__` in the Jupyter Comm.
   */
  newComm(target_name: string, data: any, metadata: any): Comm {
    var comm = new Comm(target_name, this._sendFunc);
    this.registerComm(comm);
    comm.open(data, metadata);
    return comm;
  }
   
  /**
   * Register a target function for a given target name.
   */
  registerTarget(target_name: string, f: any): void {
    this._targets.set(target_name, f);
  }
    
  /**
   * Unregister a target function for a given target name
   */
  unregisterTarget(target_name: string, f: any): void {
    this._targets.delete(target_name);
  }
    
  /**
   * Register a comm in the mapping.
   */
  registerComm(comm: Comm): string {
    var promise = Promise.resolve(comm);
    this._comms.set(comm.commId, promise);
    return comm.commId;
  }
    
  /**
   * Remove a comm from the mapping.
   */
  unregisterComm(comm: Comm): void {
    this._comms.delete(comm.commId);
  }
    
  /**
   * comm_open message handler.
   */  
  commOpen(msg: IKernelMsg): Promise<Comm> {
    var content = msg.content;
    var that = this;
    var commId = content.commId;

    var promise = utils.loadClass(content.target_name, content.target_module, 
        this._targets).then(function(target:(a:any,b:any)=> any) {
          var cb = this._sendFunc;
          var comm = new Comm(content.target_name, cb, commId);
            try {
                var response = target(comm, msg);
            } catch (e) {
                comm.close();
                that.unregisterComm(comm);
                console.error("Exception opening new comm");
                return Promise.reject(e);
            }
            // Regardless of the target return value, we need to
            // then return the comm
            return Promise.resolve(response).then(function() {return comm;});
        }, () => {throw Error('Could not open comm')});
    this._comms.set(commId, promise);
    return promise;
  }
    
  /**
   * comm_close message handler.
   */  
  commClose(msg: IKernelMsg): Promise<void> {
    var content = msg.content;
    var promise = this._comms.get(content.commId);
    if (promise === undefined) {
        console.error('Comm promise not found for comm id ' + content.commID);
        return;
    }
    promise.then((comm) => {
      this.unregisterComm(comm);
      try {
          comm.handleClose(msg);
      } catch (e) {
          console.log("Exception closing comm: ", e, e.stack, msg);
      }
      // don't return a comm, so that further .then() functions
      // get an undefined comm input
    });
    this._comms.delete(content.commID);
    return Promise.resolve(undefined)
  }

  /**
   * comm_msg message handler.
   */  
  commMsg(msg: IKernelMsg): Promise<Comm> {
    var content = msg.content;
    var promise = this._comms.get(content.commId);
    if (promise === undefined) {
      console.error('Comm promise not found for comm id ' + content.commID);
      return;
    }

    promise = promise.then(function(comm) {
      try {
        comm.handleMsg(msg);
      } catch (e) {
        console.log("Exception handling comm msg: ", e, e.stack, msg);
      }
      return comm;
    });

    this._comms.set(content.commId, promise);
    return promise;
  }
    
  private _targets: Map<string, () => void> = null;
  private _comms: Map<string, Promise<Comm>> = null;
  private _sendFunc: () => IKernelFuture = null;
}


export 
class Comm {

  constructor(target_name: string, sendFunc: any, commID?: string) {
    this._targetName = target_name;
    this._commId = commID || utils.uuid();
    this._sendFunc = sendFunc;
  }

  /**
   * Get the comm id.
   */
  get commId(): string {
    return this._commId;
  }

  /**
   * Set the comm id.
   */
  set commId(id: string) {
    this._commId = id;
  }
    
  /** 
   * Send a comm_open message.
   */
  open(data: any, metadata: any): IKernelFuture {
    var content = {
      comm_id : this._commId,
      target_name : this._targetName,
      data : data || {},
    };
    var sendFunc = this._sendFunc;
    return sendFunc("comm_open", content, metadata);
  }
    
  /**
   * Send a comm_msg message.
   */
  send(data: any, metadata: any, buffers?: any): IKernelFuture {
    var content = {
      comm_id : this._commId,
      data : data || {},
    };
    var sendFunc = this._sendFunc;
    return sendFunc("comm_msg", content, metadata, buffers);
  }
    
  /**
   * Send a comm_close message.
   */
  close(data?: any, metadata?: any): IKernelFuture {
    var content = {
      comm_id : this._commId,
      data : data || {},
    };
    var sendFunc = this._sendFunc;
    return sendFunc("comm_close", content, metadata);
  }
    
  /**
   * Register an comm_msg callback.
   */
  onMsg(cb: (msg: IKernelMsg) => void) {
    this._msgCallback = cb;
  }
    
  /**
   * Register a comm_close callback.
   */
  onClose(cb: (msg: IKernelMsg) => void) {
    this._closeCallback = cb;
  }
    
  /**
   * Handle an incoming comm_msg message.
   */
  handleMsg(msg: IKernelMsg) {
    var cb = this._msgCallback;
    if (cb) cb(msg);
  }
  
  /**
   * Handle an incoming comm_close message.
   */
  handleClose(msg: IKernelMsg) {
    var cb = this._closeCallback;
    if (cb) cb(msg);
  }

  private _sendFunc: any = null;
  private _targetName = "unknown";
  private _commId = "unknown";
  private _msgCallback:(msg: IKernelMsg) => any = null;
  private _closeCallback:(msg: IKernelMsg) => any = null;
  
}
