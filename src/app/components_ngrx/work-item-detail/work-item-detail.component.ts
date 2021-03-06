import { WorkItemTypeControlService } from './../../services/work-item-type-control.service';
import { FormGroup } from '@angular/forms';
import { LabelUI, LabelQuery } from './../../models/label.model';
import { IterationUI } from './../../models/iteration.model';
import { AreaUI } from './../../models/area.model';
import { UserUI, UserQuery } from './../../models/user';
import { WorkItemTypeUI } from './../../models/work-item-type';
import { AuthenticationService } from 'ngx-login-client';
import { UrlService } from './../../services/url.service';
import { GetWorkItem } from './../../actions/detail-work-item.actions';
import { Observable } from 'rxjs/Observable';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AfterViewChecked,
  Component, Input, OnInit,
  OnDestroy, Output, EventEmitter,
  ElementRef, ViewChild, Renderer2, HostListener
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InlineInputComponent } from './../../widgets/inlineinput/inlineinput.component';
import { MarkdownComponent } from 'ngx-widgets';

// ngrx stuff
import { Store } from '@ngrx/store';
import { AppState } from './../../states/app.state';
import { WorkItemUI, WorkItemQuery } from './../../models/work-item';
import * as WorkItemActions from './../../actions/work-item.actions';
import * as DetailWorkItemActions from './../../actions/detail-work-item.actions';
import * as IterationActions from './../../actions/iteration.actions';
import * as GroupTypeActions from './../../actions/group-type.actions';
import * as SpaceActions from './../../actions/space.actions';
import * as CollaboratorActions from './../../actions/collaborator.actions';
import * as AreaActions from './../../actions/area.actions';
import * as WorkItemTypeActions from './../../actions/work-item-type.actions';
import * as LabelActions from './../../actions/label.actions';
import { WorkItemService } from './../../services/work-item.service';
import { CommonSelectorUI } from '../../models/common.model';

@Component({
  selector: 'work-item-detail',
  templateUrl: './work-item-detail.component.html',
  styleUrls: ['./work-item-detail.component.less']
})
export class WorkItemDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('detailHeader') detailHeader: ElementRef;
  @ViewChild('detailContent') detailContent: ElementRef;
  @ViewChild('inlineInput') inlineInput: InlineInputComponent;
  @ViewChild('descMarkdown') descMarkdown: MarkdownComponent;

  private spaceSource = this.store
    .select('listPage')
    .select('space')
    .do(s => {if (!s) this.store.dispatch(new SpaceActions.Get())})
    .filter(s => !!s);
  private labelSource = this.labelQuery.getLables();
  private areaSource: Observable<CommonSelectorUI[]>;
  private iterationSource: Observable<CommonSelectorUI[]>;
  private collaboratorSource = this.userQuery.getCollaborators();
  private workItemStateSource = this.store
    .select('listPage')
    .select('workItemStates')
    .filter(wis => !!wis.length);
  private workItemTypeSource = this.store
    .select('listPage')
    .select('workItemTypes')
    .filter(w => !!w.length);

  private combinedSources = Observable.combineLatest(
    this.labelSource, this.collaboratorSource,
    this.workItemStateSource, this.workItemTypeSource
  );

  @Input('workItem') set workItemInput(val: WorkItemUI) {
    if (val && val != null) {
      if (this.workItemSubscriber !== null) {
        this.workItemSubscriber.unsubscribe();
        this.workItemSubscriber = null;
      }
      this.detailContext = 'preview';
      const workItemNumber = val.number;
      this.setWorkItem(workItemNumber);
      this.listenToEsc = true;
    }
  }

  @Output() closePreview: EventEmitter<any> = new EventEmitter();

  private workItem: WorkItemUI = null;
  private detailContext: 'preview' | 'detail' = 'preview';
  private eventListeners: any[] = [];
  private workItemSubscriber: any = null;
  private workItemStates: string[] = [];
  private collaborators: UserUI[] = [];
  private loggedIn: boolean = false;
  private titleCallback = null;
  private descCallback = null;
  private _areas: AreaUI[] = [];
  private areas: any[] = []; // this goes in selector component
  private selectedAreas: Observable<CommonSelectorUI[]>; // this goes in selector component
  private iterations: Observable<any[]>; // this goes in selector component
  private selectedIterations: Observable<CommonSelectorUI[]>; // this goes in selector component
  private labels: LabelUI[] = [];
  private wiTypes: WorkItemTypeUI[] = [];

  private loadingComments: boolean = true;
  private loadingTypes: boolean = false;
  private loadingIteration: boolean = false;
  private loadingArea: boolean = false;
  private loadingLabels: boolean = false;
  private loadingAssignees: boolean = false;
  private loggedInUser: UserUI = null;
  private listenToEsc: boolean = false;
  private dynamicFormGroup: FormGroup;
  private dynamicFormDataArray: any;
  private dynamicKeyValueFields: {key: string; value: string | number | null; field: any}[];

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private urlService: UrlService,
    private auth: AuthenticationService,
    private renderer: Renderer2,
    private workItemService: WorkItemService,
    private workItemTypeControlService: WorkItemTypeControlService,
    private sanitizer: DomSanitizer,
    private userQuery: UserQuery,
    private labelQuery: LabelQuery,
    private workItemQuery: WorkItemQuery
  ) {

  }

  ngOnInit() {
    const currentRoute = this.router.url;
    this.loggedIn = this.auth.isLoggedIn();
    if (currentRoute.includes('plan/detail/')) {
      this.detailContext = 'detail';
      const workItemNumber = currentRoute.split('plan/detail/')[1];
      this.setWorkItem(workItemNumber);
    }
  }

  ngOnDestroy() {
    this.eventListeners.forEach(e => e.unsubscribe());
    if (this.workItemSubscriber !== null) {
      this.workItemSubscriber.unsubscribe();
      this.workItemSubscriber = null;
    }
    if(document.getElementsByTagName('body')[0].style.overflow === "hidden") {
      document.getElementsByTagName('body')[0].removeAttribute('style');
    }
  }

  ngAfterViewChecked() {
    if(this.detailContext === 'detail') {
      if(this.detailHeader) {
        let HdrDivHeight:any =  this.detailHeader.nativeElement.offsetHeight;
        let targetHeight:any = window.innerHeight - HdrDivHeight - 90;
        this.renderer.setStyle(this.detailContent.nativeElement, 'height', targetHeight + "px");
      }
    }
    if(document.getElementsByTagName('body')) {
      document.getElementsByTagName('body')[0].style.overflow = "hidden";
    }
  }

  setWorkItem(wiNumber: string | number) {
    this.iterationSource = this.workItemQuery.getIterationsForWorkItem(wiNumber);
    this.selectedIterations = this.getSelectedItems(this.iterationSource);
    this.areaSource = this.workItemQuery.getAreasForWorkItem(wiNumber);
    this.selectedAreas = this.getSelectedItems(this.areaSource);
    this.workItemSubscriber =
      this.spaceSource
      .switchMap(s => {
        return this.combinedSources
      })
      .switchMap(([labels, collabs, states, type]) => {
        this.collaborators = collabs.filter(c => !c.currentUser);
        this.loggedInUser = collabs.find(c => c.currentUser);
        this.labels = labels;
        this.wiTypes = type;
        this.store.dispatch(new DetailWorkItemActions.GetWorkItem({
          number: wiNumber
        }));
        return this.workItemQuery.getWorkItem(wiNumber);
      })
      .filter(w => w !== null)
      .subscribe(workItem => {
        if((this.detailContext === 'preview')
        && this.descMarkdown && this.workItem.id !== workItem.id) {
          this.descMarkdown.deactivateEditor();
        }

        this.workItem = workItem;
        const wiType = this.wiTypes.find(t => t.id === this.workItem.type.id);
        this.workItemStates = wiType.fields['system.state'].type.values;
        this.loadingAssignees = false;
        this.loadingArea = false;
        this.loadingIteration = false;
        this.loadingLabels = false;

        // init dynamic form
        if (this.workItem.type) {
          this.dynamicFormGroup = this.workItemTypeControlService.toFormGroup(this.workItem);
          this.dynamicFormDataArray = this.workItemTypeControlService.toAttributeArray(this.workItem.type.fields);
          this.dynamicKeyValueFields = this.workItem.type.dynamicfields.map(item => {
            return {
              key: item,
              value: this.workItem.dynamicfields[item],
              field: this.workItem.type.fields[item]
            };
          });
        }

        if((this.detailContext === 'preview')
        && (this.descMarkdown)) {
          this.descMarkdown.deactivateEditor();
        }

        // set title on update
        if (this.titleCallback !== null) {
          this.titleCallback(this.workItem.title);
          this.titleCallback = null;
        }

        // set desc on update
        if (this.descCallback !== null) {
          this.descCallback(
            this.workItem.description,
            this.sanitizer.bypassSecurityTrustHtml(this.workItem.descriptionRendered)
          );
          this.descCallback = null;
        }
      });
  }

  getSelectedItems(itemSource: Observable<CommonSelectorUI[]>)
    :Observable<CommonSelectorUI[]> {
    return itemSource.map(items => {
      return items.filter(i => i.selected)
    })
  }

  closeDetail() {
    this.workItem = null;
    if (this.workItemSubscriber !== null) {
      this.workItemSubscriber.unsubscribe();
      this.workItemSubscriber = null;
    }
    if (this.detailContext === 'detail') {
      this.navigateBack();
    } else {
      this.inlineInput.closeClick();
      this.closePreview.emit();
    }
  }

  navigateBack() {
    if (this.urlService.getLastListOrBoard() === '') {
      this.router.navigate(['../..'], { relativeTo: this.route });
    } else {
      this.router.navigateByUrl(this.urlService.getLastListOrBoard());
    }
  }

  constructUrl(workItem: WorkItemUI) {
    return this.router.url.split('plan')[0] + 'plan/detail/' + workItem.number;
  }

  saveTitle(event) {
    const value = event.value.trim();
    this.titleCallback = event.callBack;
    if (value === '') {
      this.titleCallback(value, 'Empty title not allowed');
    } else if (this.workItem.title === value) {
      this.titleCallback(value);
    } else {
      let workItem = {} as WorkItemUI;
      workItem['version'] = this.workItem.version;
      workItem['link'] = this.workItem.link;
      workItem['id'] = this.workItem.id;
      workItem['title'] = value;
      workItem['type'] = this.workItem.type;
      this.store.dispatch(new WorkItemActions.Update(workItem));
    }
  }

  onChangeState(state) {
    if (state !== this.workItem.state) {
      let workItem = {} as WorkItemUI;
      workItem['version'] = this.workItem.version;
      workItem['link'] = this.workItem.link;
      workItem['id'] = this.workItem.id;
      workItem['type'] = this.workItem.type;

      workItem['state'] = state;
      this.store.dispatch(new WorkItemActions.Update(workItem));
    }
  }

  assignUser(users) {
    this.loadingAssignees = true;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;
    workItem['assignees'] = users.map(u => u.id);
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  areaUpdated(event) {
    const areaID = event[0].key;
    this.loadingArea = true;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;
    workItem['areaId'] = areaID;
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  iterationUpdated(event) {
    const iterationID = event[0].key;
    this.loadingIteration = true;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;

    workItem['iterationId'] =  iterationID;
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  updateLabels(labels) {
    this.loadingLabels = true;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;

    workItem['labels'] = labels.map(l => l.id);
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  removeLable(label) {
    this.loadingLabels = true;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;

    workItem['labels'] = this.workItem.labels.filter(l => l != label.id);
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  showPreview(event: any): void {
    const rawText = event.rawText;
    const callBack = event.callBack;
    this.workItemService.renderMarkDown(rawText)
      .subscribe(renderedHtml => {
        callBack(
          rawText,
          this.sanitizer.bypassSecurityTrustHtml(renderedHtml)
        );
      })
  }

  descUpdate(event: any): void {
    const rawText = event.rawText;
    this.descCallback = event.callBack;
    let workItem = {} as WorkItemUI;
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;
    workItem['description'] = {
      content: rawText,
      markup: 'Markdown'
    };
    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  dynamicFieldUpdated(event) {
    let workItem = {} as WorkItemUI;
    //let dynamicfield[event]
    workItem['version'] = this.workItem.version;
    workItem['link'] = this.workItem.link;
    workItem['id'] = this.workItem.id;
    workItem['type'] = this.workItem.type;

    workItem['dynamicfields'] = {};
    workItem['dynamicfields'][event.key] = event.newValue;

    this.store.dispatch(new WorkItemActions.Update(workItem));
  }

  @HostListener('window:keydown', ['$event'])
  onKeyEvent(event: any) {
    // for ESC key handling
    if (event.keyCode == 27 && this.listenToEsc) {
     this.closeDetail();
     this.listenToEsc = false;
    }
  }
}
