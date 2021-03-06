import { NgModule }         from '@angular/core';
import { CommonModule }     from '@angular/common';

import {
  HttpModule,
  Http,
  XHRBackend,
  RequestOptions
} from '@angular/http';

import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipConfig, TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-modal';
import {
  AlmIconModule,
  DialogModule,
  InfiniteScrollModule,
  WidgetsModule
} from 'ngx-widgets';

import { NgxDatatableModule } from 'rh-ngx-datatable';

import { FilterColumn } from '../../pipes/column-filter.pipe';

import { EmptyStateModule } from 'patternfly-ng/empty-state';
import { Logger } from 'ngx-base';
import { AuthenticationService } from 'ngx-login-client';


import { GlobalSettings } from '../../shared/globals';
import {
  FabPlannerAssociateIterationModalModule
} from '../work-item-iteration-modal/work-item-iteration-modal.module';
import { GroupTypesModule } from '../group-types-panel/group-types-panel.module';
import { IterationModule } from '../iterations-panel/iterations-panel.module';
import { LabelsModule } from '../labels/labels.module';
import { PlannerModalModule } from '../modal/modal.module';
import { PlannerListRoutingModule } from './planner-list-routing.module';
import { SidepanelModule } from '../side-panel/side-panel.module';
import { ToolbarPanelModule } from '../toolbar-panel/toolbar-panel.module';
import { UrlService } from './../../services/url.service';
import { WorkItemDetailModule } from '../work-item-detail/work-item-detail.module';
import { WorkItemDetailAddTypeSelectorModule } from '../work-item-create/work-item-create.module';
import { PlannerListComponent } from './planner-list.component';
import { WorkItemQuickAddModule } from '../work-item-quick-add/work-item-quick-add.module';
import { PlannerLayoutModule } from './../../widgets/planner-layout/planner-layout.module';
import { WorkItemService } from '../../services/work-item.service';
import { HttpService, factoryForHttpService } from '../../services/http-service';
import { LabelService } from '../../services/label.service';
import { AssigneesModule } from './../assignee/assignee.module';
import { WorkItemCellComponent } from '../work-item-cell/work-item-cell.component';
import { CookieService } from '../../services/cookie.service';
import { WorkItemDataService } from './../../services/work-item-data.service';
import { EventService } from './../../services/event.service';

// ngrx stuff
import {
  StoreModule
} from '@ngrx/store';
import { IterationState, initialState as initialIterationState } from './../../states/iteration.state';
import { iterationReducer } from './../../reducers/iteration-reducer';

let providers = [
    BsDropdownConfig,
    GlobalSettings,
    WorkItemService,
    WorkItemDataService,
    EventService,
    Logger,
    {
      provide: HttpService,
      useFactory: factoryForHttpService,
      deps: [XHRBackend, RequestOptions, AuthenticationService]
    },
    LabelService,
    TooltipConfig,
    UrlService,
    CookieService
  ];

@NgModule({
  imports: [
    AlmIconModule,
    AssigneesModule,
    BsDropdownModule.forRoot(),
    CommonModule,
    DialogModule,
    EmptyStateModule,
    FabPlannerAssociateIterationModalModule,
    HttpModule,
    InfiniteScrollModule,
    GroupTypesModule,
    IterationModule,
    LabelsModule,
    ModalModule,
    PlannerLayoutModule,
    PlannerListRoutingModule,
    SidepanelModule,
    ToolbarPanelModule,
    TooltipModule.forRoot(),
    WidgetsModule,
    WorkItemDetailModule,
    WorkItemQuickAddModule,
    WorkItemDetailAddTypeSelectorModule,
    PlannerModalModule,
    NgxDatatableModule,
    StoreModule.forFeature('listPage', {
        iterations: iterationReducer
      }, {
      initialState: {
        iterations: initialIterationState
      }
    })
  ],
  declarations: [
    PlannerListComponent,
    WorkItemCellComponent,
    FilterColumn
  ],
  providers: providers,
  exports: [ PlannerListComponent ]
})
export class PlannerListModule {
  constructor(http: Http) {}
}
